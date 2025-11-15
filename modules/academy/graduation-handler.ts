/**
 * ACADEMY → HR PIPELINE
 * Graduation Handler - Automatic Employee Onboarding
 * 
 * Triggers when student completes their training course.
 * Automatically creates:
 * - Employee record
 * - Bench consultant profile
 * - Pod membership
 * - Role assignment
 * - Onboarding workflow
 * 
 * This is the "nervous system" connecting Academy to HR/CRM modules
 */

import { createClient } from '@/lib/supabase/server';
import { getWorkflowEngine } from '@/lib/workflows/engine';

// ============================================================================
// TYPES
// ============================================================================

interface GraduationResult {
  employee: any;
  benchProfile: any;
  podMembership: any;
  workflow: any;
  success: boolean;
  message: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const BENCH_SALES_DEPT_CODE = 'BENCH_SALES';
const BENCH_SALES_POD_CODE = 'BENCH_SALES_GW';
const BENCH_CONSULTANT_ROLE_CODE = 'bench_consultant';

// ============================================================================
// MAIN GRADUATION HANDLER
// ============================================================================

/**
 * Handle course completion and convert student to employee
 */
export async function onCourseCompletion(
  userId: string,
  productCode: string // 'CC', 'PC', 'BC'
): Promise<GraduationResult> {
  const supabase = createClient();

  try {
    // 1. Get student profile
    const { data: student, error: studentError } = await supabase
      .from('student_profiles')
      .select('*, user_profiles(*)')
      .eq('user_id', userId)
      .single();

    if (studentError || !student) {
      throw new Error('Student profile not found');
    }

    // 2. Get product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('code', productCode)
      .single();

    if (productError || !product) {
      throw new Error('Product not found');
    }

    // 3. Check if employee record already exists
    const { data: existingEmployee } = await supabase
      .from('employee_records')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingEmployee) {
      return {
        employee: existingEmployee,
        benchProfile: null,
        podMembership: null,
        workflow: null,
        success: false,
        message: 'Employee record already exists'
      };
    }

    // 4. Get department
    const { data: department } = await supabase
      .from('departments')
      .select('id')
      .eq('code', BENCH_SALES_DEPT_CODE)
      .single();

    if (!department) {
      throw new Error('Bench Sales department not found');
    }

    // 5. Create employee record
    const employeeId = await generateEmployeeId(supabase);
    const { data: employee, error: employeeError } = await supabase
      .from('employee_records')
      .insert({
        user_id: userId,
        employee_id: employeeId,
        department_id: department.id,
        designation: 'Senior Consultant',
        employment_type: 'Bench',
        employment_status: 'Available',
        hire_date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (employeeError) {
      throw new Error(`Failed to create employee: ${employeeError.message}`);
    }

    // 6. Assign bench_consultant role
    const { data: role } = await supabase
      .from('roles')
      .select('id')
      .eq('code', BENCH_CONSULTANT_ROLE_CODE)
      .single();

    if (role) {
      await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role_id: role.id,
          assigned_by: userId // Self-assigned via graduation
        });
    }

    // 7. Get bench sales pod
    const { data: pod } = await supabase
      .from('pods')
      .select('id')
      .eq('code', BENCH_SALES_POD_CODE)
      .single();

    let podMembership = null;
    if (pod) {
      // Add to bench sales pod
      const { data: membership } = await supabase
        .from('pod_members')
        .insert({
          pod_id: pod.id,
          user_id: userId,
          role: 'consultant'
        })
        .select()
        .single();

      podMembership = membership;
    }

    // 8. Create bench profile for marketing
    const { data: benchProfile, error: benchError } = await supabase
      .from('bench_profiles')
      .insert({
        employee_id: employee.id,
        technology: getTechnologyName(productCode),
        experience_level: student.assumed_persona || 'Entry Level',
        availability: 'Immediate',
        status: 'Available',
        skills: getSkillsForProduct(productCode)
      })
      .select()
      .single();

    if (benchError) {
          }

    // 9. Start employee onboarding workflow
    const workflowEngine = getWorkflowEngine();
    const workflow = await workflowEngine.startWorkflow({
      templateCode: 'employee_onboarding',
      objectType: 'employee',
      objectId: employee.id,
      name: `Onboarding: ${student.user_profiles.full_name}`,
      ownerId: userId
    });

    // 10. Notify recruitment team
    if (pod) {
      await notifyPodMembers(supabase, pod.id, {
        type: 'new_consultant',
        title: 'New Consultant Available',
        message: `${student.user_profiles.full_name} completed ${product.name} training and is available for placements`,
        actionUrl: `/employee/bench/${employee.id}`,
        employeeId: employee.id
      });
    }

    // 11. Log for learning system
    await logSystemFeedback(supabase, {
      entity_type: 'graduation',
      entity_id: userId,
      action_type: 'academy_to_hr_pipeline',
      outcome: 'success',
      performance_metrics: {
        product: productCode,
        assumed_persona: student.assumed_persona,
        employee_id: employeeId
      }
    });

    return {
      employee,
      benchProfile,
      podMembership,
      workflow,
      success: true,
      message: `Successfully graduated ${student.user_profiles.full_name} to bench consultant`
    };
  } catch (error: any) {
        
    // Log failure
    const supabase = createClient();
    await logSystemFeedback(supabase, {
      entity_type: 'graduation',
      entity_id: userId,
      action_type: 'academy_to_hr_pipeline',
      outcome: 'failure',
      performance_metrics: {
        error: error.message
      }
    });

    return {
      employee: null,
      benchProfile: null,
      podMembership: null,
      workflow: null,
      success: false,
      message: `Graduation failed: ${error.message}`
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate unique employee ID
 */
async function generateEmployeeId(supabase: any): Promise<string> {
  const year = new Date().getFullYear();
  
  // Get last employee ID for this year
  const { data: lastEmployee } = await supabase
    .from('employee_records')
    .select('employee_id')
    .like('employee_id', `EMP-${year}-%`)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (lastEmployee) {
    // Extract number and increment
    const match = lastEmployee.employee_id.match(/EMP-\d{4}-(\d{4})/);
    if (match) {
      const nextNumber = parseInt(match[1]) + 1;
      return `EMP-${year}-${nextNumber.toString().padStart(4, '0')}`;
    }
  }

  // First employee of the year
  return `EMP-${year}-0001`;
}

/**
 * Get technology name from product code
 */
function getTechnologyName(productCode: string): string {
  const mapping: Record<string, string> = {
    'CC': 'ClaimCenter',
    'PC': 'PolicyCenter',
    'BC': 'BillingCenter',
    'COMMON': 'Guidewire Common'
  };
  return mapping[productCode] || productCode;
}

/**
 * Get default skills for a product
 */
function getSkillsForProduct(productCode: string): string[] {
  const baseSkills = ['Guidewire', 'Insurance', 'Java', 'GOSU'];
  
  const productSkills: Record<string, string[]> = {
    'CC': [...baseSkills, 'ClaimCenter', 'Claims Management'],
    'PC': [...baseSkills, 'PolicyCenter', 'Policy Administration'],
    'BC': [...baseSkills, 'BillingCenter', 'Billing & Invoicing'],
    'COMMON': [...baseSkills, 'Integration', 'Data Model']
  };

  return productSkills[productCode] || baseSkills;
}

/**
 * Notify all pod members
 */
async function notifyPodMembers(
  supabase: any,
  podId: string,
  notification: {
    type: string;
    title: string;
    message: string;
    actionUrl: string;
    employeeId: string;
  }
): Promise<void> {
  // Get all pod members
  const { data: members } = await supabase
    .from('pod_members')
    .select('user_id')
    .eq('pod_id', podId)
    .eq('is_active', true);

  if (!members || members.length === 0) {
        return;
  }

  // Create notification for each member
  const notifications = members.map((member: any) => ({
    user_id: member.user_id,
    type: 'success',
    category: 'recruitment',
    title: notification.title,
    message: notification.message,
    related_entity_type: 'employee',
    related_entity_id: notification.employeeId,
    action_url: notification.actionUrl
  }));

  await supabase
    .from('notifications')
    .insert(notifications);
}

/**
 * Log system feedback for learning
 */
async function logSystemFeedback(
  supabase: any,
  feedback: {
    entity_type: string;
    entity_id: string;
    action_type: string;
    outcome: string;
    performance_metrics: any;
  }
): Promise<void> {
  await supabase
    .from('system_feedback')
    .insert(feedback);
}

// ============================================================================
// TRIGGER HELPER (for database triggers)
// ============================================================================

/**
 * Check if student has completed all topics for their product
 * This can be called from a database trigger or API endpoint
 */
export async function checkCourseCompletion(userId: string): Promise<boolean> {
  const supabase = createClient();

  // Get student's preferred product
  const { data: student } = await supabase
    .from('student_profiles')
    .select('preferred_product_id')
    .eq('user_id', userId)
    .single();

  if (!student || !student.preferred_product_id) {
    return false;
  }

  // Get total topics for this product
  const { count: totalTopics } = await supabase
    .from('topics')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', student.preferred_product_id)
    .eq('published', true);

  // Get completed topics for this user
  const { count: completedTopics } = await supabase
    .from('topic_completions')
    .select('topics!inner(product_id)', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('topics.product_id', student.preferred_product_id);

  // Course is complete if all topics are done
  return totalTopics === completedTopics && totalTopics! > 0;
}

/**
 * Auto-trigger handler (can be called from API route or database trigger)
 */
export async function handleTopicCompletion(
  userId: string,
  topicId: string
): Promise<void> {
  // Check if this completion triggers graduation
  const isComplete = await checkCourseCompletion(userId);

  if (isComplete) {
    // Get student's product
    const supabase = createClient();
    const { data: student } = await supabase
      .from('student_profiles')
      .select('preferred_product_id, products(code)')
      .eq('user_id', userId)
      .single();

    if (student && student.products?.code) {
      // Trigger graduation
      await onCourseCompletion(userId, student.products.code);
    }
  }
}

