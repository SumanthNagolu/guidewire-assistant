import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { logger } from '@/lib/utils/logger';
// Validation schema
const applicationSchema = z.object({
  jobId: z.string(),
  jobTitle: z.string(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  linkedin: z.string().optional(),
  yearsExperience: z.string().min(1, 'Experience is required'),
  currentLocation: z.string().min(1, 'Location is required'),
  workAuthorization: z.string().min(1, 'Work authorization is required'),
  availability: z.string().min(1, 'Availability is required'),
  expectedSalary: z.string().min(1, 'Expected salary is required'),
  resumeText: z.string().min(50, 'Resume/skills summary is too short'),
  coverLetter: z.string().optional()
});
export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Validate input
    const validatedData = applicationSchema.parse(body);
    // Initialize Supabase client
    const supabase = await createClient();
    // Check if candidate already exists by email
    let candidateId;
    const { data: existingCandidate } = await supabase
      .from('candidates')
      .select('id')
      .eq('email', validatedData.email)
      .single();
    if (existingCandidate) {
      candidateId = existingCandidate.id;
    } else {
      // Create new candidate record
      const { data: newCandidate, error: candidateError } = await supabase
        .from('candidates')
        .insert({
          first_name: validatedData.firstName,
          last_name: validatedData.lastName,
          email: validatedData.email,
          phone: validatedData.phone,
          linkedin_url: validatedData.linkedin || null,
          current_location: validatedData.currentLocation,
          work_authorization: validatedData.workAuthorization,
          availability: validatedData.availability,
          expected_salary: validatedData.expectedSalary,
          resume_text: validatedData.resumeText,
          source: 'Website Application',
          status: 'new'
        })
        .select('id')
        .single();
      if (candidateError) {
        logger.error('Error creating candidate:', candidateError);
        throw new Error('Failed to create candidate record');
      }
      candidateId = newCandidate.id;
    }
    // Find matching job (if exists)
    const { data: job } = await supabase
      .from('jobs')
      .select('id')
      .eq('title', validatedData.jobTitle)
      .eq('status', 'open')
      .single();
    let applicationData: any = {
      candidate_id: candidateId,
      stage: 'applied',
      source: 'Website',
      notes: validatedData.coverLetter || null,
      resume_submitted_at: new Date().toISOString()
    };
    // If job exists, create application
    if (job) {
      applicationData.job_id = job.id;
    }
    const { error: applicationError } = await supabase
      .from('applications')
      .insert(applicationData);
    if (applicationError) {
      logger.error('Error creating application:', applicationError);
      // Don't throw error here - candidate was created successfully
    }
    // Log activity
    await supabase
      .from('activities')
      .insert({
        entity_type: 'candidate',
        entity_id: candidateId,
        activity_type: 'application_submitted',
        description: `Applied for: ${validatedData.jobTitle}`,
        metadata: {
          job_id: job?.id,
          job_title: validatedData.jobTitle,
          source: 'Website',
          availability: validatedData.availability,
          expected_salary: validatedData.expectedSalary
        }
      });
        // This would integrate with Resend or SendGrid
    return NextResponse.json(
      { 
        success: true, 
        message: 'Application submitted successfully',
        candidateId 
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Application submission error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation error', 
          issues: error.issues 
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to submit application' 
      },
      { status: 500 }
    );
  }
}
