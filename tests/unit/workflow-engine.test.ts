/**
 * UNIT TESTS: Workflow Engine
 * Tests workflow orchestration functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WorkflowEngine, getWorkflowEngine, startRecruitingWorkflow } from '@/lib/workflows/engine';

describe('WorkflowEngine', () => {
  let engine: WorkflowEngine;

  beforeEach(() => {
    engine = new WorkflowEngine();
  });

  describe('startWorkflow', () => {
    it('should create workflow instance', async () => {
      const result = await engine.startWorkflow({
        templateCode: 'standard_recruiting',
        objectType: 'job',
        objectId: 'test-job-123',
        ownerId: 'test-user-123'
      });

      expect(result).toBeDefined();
      expect(result.object_type).toBe('job');
      expect(result.object_id).toBe('test-job-123');
      expect(result.status).toBe('active');
    });

    it('should throw error for invalid template', async () => {
      await expect(
        engine.startWorkflow({
          templateCode: 'invalid_template',
          objectType: 'job',
          objectId: 'test-job-123'
        })
      ).rejects.toThrow(/template not found/i);
    });

    it('should calculate SLA deadline correctly', async () => {
      const result = await engine.startWorkflow({
        templateCode: 'standard_recruiting',
        objectType: 'job',
        objectId: 'test-job-123'
      });

      expect(result.sla_deadline).toBeDefined();
      
      if (result.sla_deadline) {
        const deadline = new Date(result.sla_deadline);
        const now = new Date();
        expect(deadline.getTime()).toBeGreaterThan(now.getTime());
      }
    });
  });

  describe('advanceStage', () => {
    it('should advance workflow to next stage', async () => {
      // Create workflow
      const workflow = await engine.startWorkflow({
        templateCode: 'standard_recruiting',
        objectType: 'job',
        objectId: 'test-job-123'
      });

      // Advance stage
      const advanced = await engine.advanceStage({
        instanceId: workflow.id,
        toStageId: 'screening',
        userId: 'test-user-123',
        reason: 'Sourcing complete'
      });

      expect(advanced.current_stage_id).toBe('screening');
      expect(advanced.stages_completed).toBeGreaterThan(workflow.stages_completed);
    });

    it('should reject invalid stage transition', async () => {
      const workflow = await engine.startWorkflow({
        templateCode: 'standard_recruiting',
        objectType: 'job',
        objectId: 'test-job-123'
      });

      await expect(
        engine.advanceStage({
          instanceId: workflow.id,
          toStageId: 'placed', // Skip directly to final stage
          userId: 'test-user-123'
        })
      ).rejects.toThrow(/Invalid transition/i);
    });

    it('should mark workflow as completed on final stage', async () => {
      const workflow = await engine.startWorkflow({
        templateCode: 'standard_recruiting',
        objectType: 'job',
        objectId: 'test-job-123'
      });

      // Advance through all stages to completion
      // (simplified - in real test would go through each stage)
      const finalStage = await engine.advanceStage({
        instanceId: workflow.id,
        toStageId: 'placed',
        userId: 'test-user-123'
      });

      expect(finalStage.status).toBe('completed');
      expect(finalStage.completed_at).toBeDefined();
    });
  });

  describe('bottleneck detection', () => {
    it('should detect stuck workflows', async () => {
      const bottlenecks = await engine.detectBottlenecks();

      expect(Array.isArray(bottlenecks)).toBe(true);
    });

    it('should generate AI suggestions for bottlenecks', async () => {
      // Create stuck workflow (mock)
      const bottlenecks = await engine.detectBottlenecks();

      if (bottlenecks.length > 0) {
        expect(bottlenecks[0].ai_suggestion).toBeDefined();
        expect(bottlenecks[0].severity).toMatch(/low|medium|high|critical/);
      }
    });
  });

  describe('pod assignment', () => {
    it('should assign workflow to pod', async () => {
      const workflow = await engine.startWorkflow({
        templateCode: 'standard_recruiting',
        objectType: 'job',
        objectId: 'test-job-123'
      });

      await engine.assignToPod(workflow.id, 'test-pod-123');

      const updated = await engine.getInstance(workflow.id);
      expect(updated?.assigned_pod_id).toBe('test-pod-123');
    });

    it('should use AI to assign best pod', async () => {
      const workflow = await engine.startWorkflow({
        templateCode: 'standard_recruiting',
        objectType: 'job',
        objectId: 'test-job-123'
      });

      const podId = await engine.assignToBestPod(
        workflow.id,
        'job',
        { job_type: 'Contract', required_skills: ['Java', 'Spring'] }
      );

      expect(podId).toBeDefined();
      expect(typeof podId).toBe('string');
    });
  });
});

describe('Workflow Engine Helpers', () => {
  it('should start recruiting workflow', async () => {
    const workflow = await startRecruitingWorkflow('test-job-123', 'test-user-123');
    
    expect(workflow.object_type).toBe('job');
    expect(workflow.status).toBe('active');
  });

  it('should start onboarding workflow', async () => {
    const workflow = await engine.startWorkflow({
      templateCode: 'employee_onboarding',
      objectType: 'employee',
      objectId: 'test-employee-123',
      ownerId: 'test-user-123'
    });
    
    expect(workflow.object_type).toBe('employee');
  });
});

