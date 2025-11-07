import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const jsonError = (error: string, status = 400) =>
  Response.json({ success: false, error }, { status });

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // Check auth
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return jsonError('Unauthorized', 401);
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // Allow admin users OR check for bootstrap key for initial setup
    const { action, bootstrapKey } = await req.json();
    const isBootstrap = bootstrapKey === process.env.SETUP_BOOTSTRAP_KEY;
    const isAdmin = profile?.role === 'admin';

    if (!isAdmin && !isBootstrap) {
      return jsonError(
        'Admin access required. Contact your administrator or use the bootstrap key for initial setup.',
        403
      );
    }

    if (isBootstrap) {
      console.log('[Admin Setup] Bootstrap setup triggered by:', user.email);
    }

    if (!action) {
      return jsonError('Action is required', 400);
    }

    // Use service role client for admin operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return jsonError('Server configuration error', 500);
    }

    const adminClient = createAdminClient(supabaseUrl, supabaseServiceKey);

    switch (action) {
      case 'storage-bucket':
        return await setupStorageBucket(adminClient);

      case 'interview-templates':
        return await setupInterviewTemplates(adminClient);

      default:
        return jsonError('Unknown action', 400);
    }
  } catch (error) {
    console.error('[Admin Setup] Error:', error);
    return jsonError('Internal server error', 500);
  }
}

async function setupStorageBucket(adminClient: any) {
  try {
    // Check if bucket already exists
    const { data: buckets } = await adminClient.storage.listBuckets();
    const exists = buckets?.some((b: any) => b.id === 'guidewire-assistant-training-content');

    if (exists) {
      return Response.json({
        success: true,
        message: 'Storage bucket already exists',
        alreadyExists: true,
      });
    }

    // Create bucket
    const { data, error } = await adminClient.storage.createBucket('guidewire-assistant-training-content', {
      public: false,
      fileSizeLimit: 524288000, // 500 MB
      allowedMimeTypes: [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-powerpoint',
        'video/mp4',
        'video/quicktime',
        'video/x-msvideo',
        'video/webm',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
    });

    if (error) {
      console.error('[Storage Bucket] Error:', error);
      return jsonError(`Failed to create storage bucket: ${error.message}`, 500);
    }

    // Note: RLS policies need to be set manually in Supabase Dashboard
    // or via SQL because the JS client doesn't support policy creation

    return Response.json({
      success: true,
      message: 'Storage bucket created successfully! Note: Set up RLS policies in Supabase Dashboard.',
      data,
    });
  } catch (error) {
    console.error('[Storage Bucket] Unexpected error:', error);
    return jsonError('Failed to create storage bucket', 500);
  }
}

async function setupInterviewTemplates(adminClient: any) {
  try {
    // Check if templates already exist
    const { count } = await adminClient
      .from('interview_templates')
      .select('*', { count: 'exact', head: true });

    if ((count || 0) > 0) {
      return Response.json({
        success: true,
        message: `Interview templates already exist (${count} templates)`,
        alreadyExists: true,
      });
    }

    // Get product IDs
    const { data: products, error: productsError } = await adminClient
      .from('products')
      .select('id, code')
      .in('code', ['CC', 'PC', 'BC', 'FW']);

    if (productsError || !products) {
      return jsonError('Failed to fetch products', 500);
    }

    const productMap = new Map(products.map((p: any) => [p.code, p.id]));

    // Define templates
    const templates = [
      {
        product_id: productMap.get('CC'),
        title: 'ClaimCenter Data Model Discussion',
        description:
          'Junior-level interview focusing on ClaimCenter core entities, relationships, and claim lifecycle understanding.',
        persona: 'junior',
        focus_area: 'ClaimCenter Data Model',
        rubric: {
          scenario_prompt:
            'You are interviewing for a Junior Guidewire ClaimCenter Developer role. The interviewer will ask you about the ClaimCenter data model, including claims, exposures, incidents, and their relationships. Focus on demonstrating your understanding of: Core entities (Claim, Exposure, Incident, ClaimContact), Relationships between entities, Claim lifecycle stages, How data flows through the system. Answer clearly and ask clarifying questions when needed. Show your thought process.',
          evaluation_criteria: {
            technical_accuracy: 'Correctness of data model explanations',
            depth_of_knowledge: 'Understanding of entity relationships',
            communication: 'Clarity in explaining technical concepts',
            problem_solving: 'Ability to think through scenarios',
          },
          estimated_duration_minutes: 20,
        },
        is_active: true,
      },
      {
        product_id: productMap.get('PC'),
        title: 'PolicyCenter Configuration & Rating',
        description: 'Mid-level interview focusing on PolicyCenter product model, rating, and underwriting rules.',
        persona: 'mid',
        focus_area: 'PolicyCenter Configuration',
        rubric: {
          scenario_prompt:
            'You are interviewing for a Mid-level Guidewire PolicyCenter Configurator role. The interviewer will ask you about configuring the PolicyCenter product model, including lines of business, coverages, and rating. Focus on demonstrating your understanding of: Product Model (LOBs, Coverages, Modifiers), Rating Engine configuration, Underwriting Rules and their implementation, Policy lifecycle and transactions. Be prepared to discuss practical configuration examples.',
          evaluation_criteria: {
            technical_accuracy: 'Correctness of configuration concepts',
            depth_of_knowledge: 'Understanding of PolicyCenter architecture',
            problem_solving: 'Ability to propose configuration solutions',
            communication: 'Clarity in explaining complex setups',
          },
          estimated_duration_minutes: 30,
        },
        is_active: true,
      },
      {
        product_id: productMap.get('BC'),
        title: 'BillingCenter Integration & Cloud Deployment',
        description:
          'Senior-level interview focusing on BillingCenter integration patterns, cloud deployment, and performance optimization.',
        persona: 'senior',
        focus_area: 'BillingCenter Integration',
        rubric: {
          scenario_prompt:
            'You are interviewing for a Senior Guidewire BillingCenter Integration Architect role. The interviewer will ask you about integrating BillingCenter with external systems and deploying it in a cloud environment. Focus on demonstrating your understanding of: BillingCenter integration points (e.g., payments, general ledger), Messaging and API strategies, Cloud deployment considerations (AWS/Azure, SurePath), Performance tuning and scalability. Discuss architectural decisions and best practices.',
          evaluation_criteria: {
            technical_accuracy: 'Correctness of integration and cloud concepts',
            architectural_design: 'Ability to design robust solutions',
            problem_solving: 'Troubleshooting complex integration issues',
            communication: 'Explaining technical designs clearly',
          },
          estimated_duration_minutes: 45,
        },
        is_active: true,
      },
      {
        product_id: productMap.get('FW'),
        title: 'Guidewire Cloud Fundamentals',
        description: 'Mid-level interview focusing on Guidewire Cloud platform, SurePath methodology, and DevOps practices.',
        persona: 'mid',
        focus_area: 'Guidewire Cloud',
        rubric: {
          scenario_prompt:
            'You are interviewing for a Mid-level Guidewire Cloud Specialist role. The interviewer will ask you about the Guidewire Cloud platform, SurePath methodology, and DevOps practices within a Guidewire context. Focus on demonstrating your understanding of: Guidewire Cloud architecture and services, SurePath implementation methodology, CI/CD pipelines and automation, Cloud security and compliance. Be prepared to discuss your experience with cloud-native Guidewire projects.',
          evaluation_criteria: {
            technical_accuracy: 'Correctness of cloud concepts and terminology',
            methodology_knowledge: 'Understanding of SurePath principles',
            devops_practices: 'Familiarity with CI/CD and automation',
            problem_solving: 'Addressing cloud-specific challenges',
          },
          estimated_duration_minutes: 25,
        },
        is_active: true,
      },
      {
        product_id: null,
        title: 'Project Experience & Problem Solving',
        description:
          'Mid-level behavioral interview focusing on past project experiences, problem-solving skills, and teamwork.',
        persona: 'mid',
        focus_area: 'Behavioral & Projects',
        rubric: {
          scenario_prompt:
            'You are interviewing for a Mid-level Guidewire role. The interviewer will ask you about your past project experiences, how you approach problem-solving, and your teamwork skills. Be prepared to use the STAR method (Situation, Task, Action, Result) to describe your experiences. Focus on demonstrating: Your role and contributions in past projects, How you overcome technical challenges, Collaboration and communication skills, Lessons learned from successes and failures. Provide specific examples from your career.',
          evaluation_criteria: {
            communication: 'Clarity and conciseness of responses',
            problem_solving: 'Structured approach to challenges',
            teamwork: 'Ability to collaborate effectively',
            adaptability: 'Learning from experience',
          },
          estimated_duration_minutes: 30,
        },
        is_active: true,
      },
    ];

    // Insert templates
    const { data, error } = await adminClient.from('interview_templates').insert(templates).select();

    if (error) {
      console.error('[Interview Templates] Insert error:', error);
      return jsonError(`Failed to insert interview templates: ${error.message}`, 500);
    }

    return Response.json({
      success: true,
      message: `Successfully created ${data.length} interview templates`,
      data: { count: data.length },
    });
  } catch (error) {
    console.error('[Interview Templates] Unexpected error:', error);
    return jsonError('Failed to create interview templates', 500);
  }
}

