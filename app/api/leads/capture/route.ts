import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/utils/logger';
// Validation schema
const leadSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  company: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  source: z.enum(['contact_form', 'training_inquiry', 'staffing_inquiry']).default('contact_form'),
});
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Validate input
    const validatedData = leadSchema.parse(body);
    const supabase = await createClient();
    // Check if client already exists
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id, name')
      .eq('email', validatedData.email)
      .is('deleted_at', null)
      .single();
    let clientId: string;
    let clientName: string;
    if (existingClient) {
      // Client exists, use existing
      clientId = existingClient.id;
      clientName = existingClient.name;
    } else {
      // Create new client
      const clientData = {
        name: validatedData.company || `${validatedData.name} (Individual)`,
        email: validatedData.email,
        phone: validatedData.phone || null,
        status: 'prospect',
        tier: 'bronze',
        notes: `Lead captured from website contact form.\n\nContact: ${validatedData.name}\nMessage: ${validatedData.message}\nSource: ${validatedData.source}`,
      };
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert([clientData])
        .select()
        .single();
      if (clientError) {
        logger.error('Error creating client:', clientError);
        throw new Error('Failed to create client');
      }
      clientId = newClient.id;
      clientName = newClient.name;
    }
    // Create opportunity
    const opportunityTitle = validatedData.source === 'training_inquiry'
      ? `Training Inquiry - ${validatedData.name}`
      : validatedData.source === 'staffing_inquiry'
      ? `Staffing Inquiry - ${validatedData.name}`
      : `Website Inquiry - ${validatedData.name}`;
    const opportunityData = {
      title: opportunityTitle,
      client_id: clientId,
      stage: 'lead',
      probability: 10,
      value: null, // TBD - will be updated by sales
      notes: validatedData.message,
      source: validatedData.source,
      expected_close_date: null,
    };
    const { data: opportunity, error: oppError } = await supabase
      .from('opportunities')
      .insert([opportunityData])
      .select()
      .single();
    if (oppError) {
      logger.error('Error creating opportunity:', oppError);
      throw new Error('Failed to create opportunity');
    }
    // Create activity log
    await supabase.from('activities').insert([{
      entity_type: 'opportunity',
      entity_id: opportunity.id,
      activity_type: 'lead_captured',
      description: `New lead captured from ${validatedData.source}: ${validatedData.name} - ${validatedData.email}`,
      metadata: {
        source: validatedData.source,
        contact_name: validatedData.name,
        contact_email: validatedData.email,
        contact_phone: validatedData.phone,
        message: validatedData.message,
      },
    }]);
        // This would integrate with Resend/SendGrid in production
    return NextResponse.json({
      success: true,
      message: 'Lead captured successfully',
      data: {
        clientId,
        clientName,
        opportunityId: opportunity.id,
        opportunityTitle: opportunity.title,
      },
    }, { status: 201 });
  } catch (error) {
    logger.error('Lead capture error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      }, { status: 400 });
    }
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to capture lead',
    }, { status: 500 });
  }
}
