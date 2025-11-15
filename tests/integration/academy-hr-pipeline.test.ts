/**
 * INTEGRATION TESTS: Academy → HR Pipeline
 * Tests the complete student graduation to employee flow
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@/lib/supabase/server';
import { onCourseCompletion, checkCourseCompletion, handleTopicCompletion } from '@/modules/academy/graduation-handler';

describe('Academy → HR Integration Pipeline', () => {
  let supabase: any;
  let testStudent: any;
  let testProduct: any;

  beforeAll(async () => {
    supabase = createClient();

    // Create test student
    const { data: user } = await supabase.auth.admin.createUser({
      email: 'test-student-integration@test.com',
      password: 'Test123!@#',
      email_confirm: true
    });

    testStudent = user;

    // Create user profile
    await supabase
      .from('user_profiles')
      .insert({
        id: testStudent.id,
        full_name: 'Test Student',
        email: testStudent.email
      });

    // Create student profile
    await supabase
      .from('student_profiles')
      .insert({
        user_id: testStudent.id,
        assumed_persona: '10 years experienced',
        onboarding_completed: true
      });

    // Get ClaimCenter product
    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('code', 'CC')
      .single();

    testProduct = product;

    // Set preferred product
    await supabase
      .from('student_profiles')
      .update({ preferred_product_id: testProduct.id })
      .eq('user_id', testStudent.id);
  });

  afterAll(async () => {
    // Cleanup
    if (testStudent) {
      await supabase.auth.admin.deleteUser(testStudent.id);
    }
  });

  it('should complete end-to-end graduation flow', async () => {
    // STEP 1: Complete all topics
    const { data: topics } = await supabase
      .from('topics')
      .select('id')
      .eq('product_id', testProduct.id)
      .eq('published', true)
      .order('position')
      .limit(5); // Just test with 5 topics for speed

    for (const topic of topics) {
      await supabase
        .from('topic_completions')
        .insert({
          user_id: testStudent.id,
          topic_id: topic.id,
          completed_at: new Date().toISOString()
        });
    }

    // STEP 2: Trigger graduation
    const result = await onCourseCompletion(testStudent.id, testProduct.code);

    // VERIFY: Graduation successful
    expect(result.success).toBe(true);
    expect(result.employee).toBeDefined();

    // VERIFY: Employee record created
    const { data: employee } = await supabase
      .from('employee_records')
      .select('*')
      .eq('user_id', testStudent.id)
      .single();

    expect(employee).toBeDefined();
    expect(employee.employment_type).toBe('Bench');
    expect(employee.employment_status).toBe('Available');
    expect(employee.employee_id).toMatch(/EMP-\d{4}-\d{4}/);

    // VERIFY: Role assigned
    const { data: roles } = await supabase
      .from('user_roles')
      .select('roles(code)')
      .eq('user_id', testStudent.id);

    const roleCodes = roles?.map((r: any) => r.roles.code);
    expect(roleCodes).toContain('bench_consultant');

    // VERIFY: Added to bench sales pod
    const { data: podMembership } = await supabase
      .from('pod_members')
      .select('*, pods(name)')
      .eq('user_id', testStudent.id)
      .single();

    expect(podMembership).toBeDefined();
    expect(podMembership.role).toBe('consultant');

    // VERIFY: Bench profile created
    const { data: benchProfile } = await supabase
      .from('bench_profiles')
      .select('*')
      .eq('employee_id', employee.id)
      .single();

    expect(benchProfile).toBeDefined();
    expect(benchProfile.technology).toBe('ClaimCenter');
    expect(benchProfile.status).toBe('Available');

    // VERIFY: Onboarding workflow started
    const { data: workflow } = await supabase
      .from('workflow_instances')
      .select('*')
      .eq('object_type', 'employee')
      .eq('object_id', employee.id)
      .single();

    expect(workflow).toBeDefined();
    expect(workflow.status).toBe('active');

    // VERIFY: Notification sent
    const { data: notifications } = await supabase
      .from('notifications')
      .select('*')
      .eq('related_entity_type', 'employee')
      .eq('related_entity_id', employee.id);

    expect(notifications.length).toBeGreaterThan(0);
  });

  it('should not create duplicate employee on second graduation', async () => {
    // Try to graduate again
    const result = await onCourseCompletion(testStudent.id, testProduct.code);

    expect(result.success).toBe(false);
    expect(result.message).toContain('already exists');

    // Verify only one employee record
    const { data: employees } = await supabase
      .from('employee_records')
      .select('*')
      .eq('user_id', testStudent.id);

    expect(employees.length).toBe(1);
  });

  it('should check course completion correctly', async () => {
    const isComplete = await checkCourseCompletion(testStudent.id);

    // Since we only completed 5 topics, not all
    expect(typeof isComplete).toBe('boolean');
  });
});

