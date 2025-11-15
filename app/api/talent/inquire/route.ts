import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { logger } from '@/lib/utils/logger';
// Validation schema
const inquirySchema = z.object({
  talentId: z.string(),
  talentName: z.string(),
  talentTitle: z.string(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  company: z.string().min(1, 'Company name is required'),
  position: z.string().optional(),
  projectType: z.string().min(1, 'Project type is required'),
  startDate: z.string().min(1, 'Start date is required'),
  duration: z.string().optional(),
  budget: z.string().optional(),
  message: z.string().min(10, 'Please provide project details')
});
export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Validate input
    const validatedData = inquirySchema.parse(body);
    // Initialize Supabase client
    const supabase = await createClient();
    // Check if client exists by email
    let clientId;
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('email', validatedData.email)
      .single();
    if (existingClient) {
      clientId = existingClient.id;
    } else {
      // Create new client record
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert({
          company_name: validatedData.company,
          email: validatedData.email,
          phone: validatedData.phone,
          industry: 'Unknown', // Default, can be updated later
          tier: 'lead',
          source: 'Website - Talent Inquiry',
          status: 'active'
        })
        .select('id')
        .single();
      if (clientError) {
        logger.error('Error creating client:', clientError);
        throw new Error('Failed to create client record');
      }
      clientId = newClient.id;
      // Create client contact
      await supabase
        .from('contacts')
        .insert({
          client_id: clientId,
          first_name: validatedData.firstName,
          last_name: validatedData.lastName,
          email: validatedData.email,
          phone: validatedData.phone,
          title: validatedData.position || 'Hiring Manager',
          is_primary: true
        });
    }
    // Create opportunity for the talent inquiry
    const { data: opportunity, error: opportunityError } = await supabase
      .from('opportunities')
      .insert({
        client_id: clientId,
        title: `Talent Request: ${validatedData.talentTitle} - ${validatedData.company}`,
        stage: 'Lead',
        value: null, // Can be calculated from budget later
        probability: 50,
        expected_close_date: null,
        source: 'Website - Talent Inquiry',
        notes: `
Talent Requested: ${validatedData.talentName} (${validatedData.talentTitle})
Project Type: ${validatedData.projectType}
Start Date: ${validatedData.startDate}
Duration: ${validatedData.duration || 'Not specified'}
Budget: ${validatedData.budget || 'Not specified'}
Project Details:
${validatedData.message}
        `.trim()
      })
      .select('id')
      .single();
    if (opportunityError) {
      logger.error('Error creating opportunity:', opportunityError);
      // Don't throw error here - client was created successfully
    }
    // Log activity
    await supabase
      .from('activities')
      .insert({
        entity_type: 'opportunity',
        entity_id: opportunity?.id || clientId,
        activity_type: 'inquiry_received',
        description: `Talent inquiry for ${validatedData.talentName} from ${validatedData.company}`,
        metadata: {
          talent_id: validatedData.talentId,
          talent_name: validatedData.talentName,
          talent_title: validatedData.talentTitle,
          project_type: validatedData.projectType,
          start_date: validatedData.startDate,
          duration: validatedData.duration,
          budget: validatedData.budget,
          contact_name: `${validatedData.firstName} ${validatedData.lastName}`,
          contact_email: validatedData.email,
          contact_phone: validatedData.phone
        }
      });
        // This would integrate with Resend or SendGrid
    return NextResponse.json(
      { 
        success: true, 
        message: 'Inquiry submitted successfully',
        clientId 
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Talent inquiry submission error:', error);
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
        message: error instanceof Error ? error.message : 'Failed to submit inquiry' 
      },
      { status: 500 }
    );
  }
}
