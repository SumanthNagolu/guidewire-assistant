/**
 * CRM CANDIDATES API
 * Unified candidate management integrated with Academy and HR
 */

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { platformOrchestrator } from '@/lib/integration/platform-orchestrator';
import { aiOrchestrator } from '@/lib/ai/orchestrator';
import { loggers } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user has recruiter permissions
    const userProfile = await platformOrchestrator.getUserCompleteProfile(user.id);
    const roles = userProfile?.roles || [];
    
    if (!roles.some(r => ['recruiter', 'sourcer', 'screener', 'admin', 'manager'].includes(r))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const skills = searchParams.get('skills');
    const location = searchParams.get('location');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;
    
    // Build query
    let query = supabase
      .from('candidates')
      .select(`
        *,
        applications(
          id,
          job_id,
          status,
          stage,
          jobs(title, client_id, clients(name))
        ),
        placements(
          id,
          start_date,
          end_date,
          bill_rate,
          status
        )
      `, { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (skills) {
      query = query.contains('skills', skills.split(','));
    }
    
    if (location) {
      query = query.ilike('location', `%${location}%`);
    }
    
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    
    const { data, error, count } = await query;
    
    if (error) {
      loggers.api.error('Error fetching candidates:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Enrich with AI insights for active candidates
    const enrichedCandidates = await Promise.all(
      (data || []).map(async (candidate) => {
        // Check if candidate has academy progress
        const academyProgress = await supabase
          .from('topic_completions')
          .select('topic_id, completed_at')
          .eq('user_id', candidate.id)
          .limit(5);
        
        return {
          ...candidate,
          academy_topics_completed: academyProgress.data?.length || 0,
          placement_count: candidate.placements?.length || 0,
          active_applications: candidate.applications?.filter((a: any) => a.status === 'active').length || 0
        };
      })
    );
    
    return NextResponse.json({
      candidates: enrichedCandidates,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    loggers.api.error('CRM Candidates API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check permissions
    const userProfile = await platformOrchestrator.getUserCompleteProfile(user.id);
    const roles = userProfile?.roles || [];
    
    if (!roles.some(r => ['recruiter', 'sourcer', 'admin'].includes(r))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      resumeUrl,
      linkedinUrl,
      currentTitle,
      currentCompany,
      yearsExperience,
      skills,
      location,
      visaStatus,
      availability,
      expectedRate,
      source,
      notes
    } = body;
    
    // Check if candidate already exists
    const { data: existing } = await supabase
      .from('candidates')
      .select('id')
      .eq('email', email)
      .single();
    
    if (existing) {
      return NextResponse.json({ 
        error: 'Candidate with this email already exists' 
      }, { status: 400 });
    }
    
    // Create candidate record
    const { data: candidate, error: candidateError } = await adminClient
      .from('candidates')
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        resume_url: resumeUrl,
        linkedin_url: linkedinUrl,
        current_title: currentTitle,
        current_company: currentCompany,
        years_experience: yearsExperience,
        skills: skills || [],
        location,
        visa_status: visaStatus,
        availability,
        expected_rate: expectedRate,
        source: source || 'manual',
        created_by: user.id
      })
      .select()
      .single();
    
    if (candidateError) {
      loggers.api.error('Error creating candidate:', candidateError);
      return NextResponse.json({ error: candidateError.message }, { status: 400 });
    }
    
    // Use AI to analyze resume and extract skills
    if (resumeUrl) {
      const aiAnalysis = await aiOrchestrator.route({
        useCase: 'recruiter',
        prompt: 'Analyze resume and extract key skills and qualifications',
        context: {
          resume_url: resumeUrl,
          candidate_id: candidate.id
        }
      });
      
      // Update candidate with AI insights
      await adminClient
        .from('candidates')
        .update({
          ai_analysis: aiAnalysis.content,
          skills: [...new Set([...skills, ...(aiAnalysis.metadata?.skills || [])])]
        })
        .eq('id', candidate.id);
    }
    
    // Create user account for candidate (for Academy access)
    const { data: authUser } = await adminClient.auth.admin.createUser({
      email,
      password: Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2),
      email_confirm: false,
      user_metadata: {
        full_name: `${firstName} ${lastName}`,
        candidate_id: candidate.id
      }
    });
    
    if (authUser?.user) {
      // Create user profile with student role
      await adminClient.from('user_profiles').insert({
        id: authUser.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        role: 'student',
        linkedin_url: linkedinUrl,
        resume_url: resumeUrl,
        skills,
        visa_status: visaStatus,
        onboarding_completed: false
      });
      
      // Assign student role for Academy access
      const { data: studentRole } = await adminClient
        .from('roles')
        .select('id')
        .eq('code', 'student')
        .single();
      
      if (studentRole) {
        await adminClient.from('user_roles').insert({
          user_id: authUser.user.id,
          role_id: studentRole.id,
          assigned_by: user.id
        });
      }
      
      // Send academy invitation email
      await fetch('/api/crm/send-academy-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: authUser.user.id, 
          email,
          name: `${firstName} ${lastName}`
        })
      });
    }
    
    // Create system event
    await adminClient.from('system_events').insert({
      event_type: 'candidate_created',
      source_module: 'crm',
      target_modules: ['academy', 'platform'],
      payload: {
        candidate_id: candidate.id,
        user_id: authUser?.user?.id,
        created_by: user.id
      }
    });
    
    // Add to talent pool workflow
    await adminClient.from('workflow_instances').insert({
      template_id: 'talent-pool-nurture',
      object_type: 'candidate',
      object_id: candidate.id,
      status: 'active',
      metadata: {
        source,
        skills,
        experience: yearsExperience
      }
    });
    
    loggers.api.info(`Candidate created: ${email} by ${user.email}`);
    
    return NextResponse.json({
      success: true,
      candidate: {
        ...candidate,
        academy_user_id: authUser?.user?.id
      },
      message: 'Candidate created and invited to Academy'
    });
  } catch (error) {
    loggers.api.error('CRM Candidates API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { candidateId, updates } = body;
    
    if (!candidateId) {
      return NextResponse.json({ error: 'Candidate ID required' }, { status: 400 });
    }
    
    // Update candidate
    const { data: candidate, error } = await adminClient
      .from('candidates')
      .update(updates)
      .eq('id', candidateId)
      .select()
      .single();
    
    if (error) {
      loggers.api.error('Error updating candidate:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    // If candidate is placed, trigger integration
    if (updates.status === 'placed') {
      await adminClient.from('system_events').insert({
        event_type: 'candidate_placed',
        source_module: 'crm',
        target_modules: ['hr', 'academy', 'productivity'],
        payload: {
          candidate_id: candidateId,
          placement_details: updates.placement_details,
          updated_by: user.id
        }
      });
    }
    
    loggers.api.info(`Candidate updated: ${candidateId} by ${user.email}`);
    
    return NextResponse.json({
      success: true,
      candidate,
      message: 'Candidate updated successfully'
    });
  } catch (error) {
    loggers.api.error('CRM Candidates API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
