# EPIC 14: Platform Setup & Configuration

**Epic ID**: ADMIN-EPIC-14  
**Epic Name**: System Configuration & Setup Utilities  
**Priority**: P0 (Critical - Infrastructure)  
**Estimated Stories**: 10  
**Estimated Effort**: 3-4 days  
**Command**: `/admin-14-setup`

---

## Epic Overview

### Goal
Platform configuration tools and setup utilities for storage, email, integrations, and system verification.

### Business Value
- Easy platform configuration
- System health monitoring
- Integration management
- Automated setup processes
- Troubleshooting tools

### Key User Stories (10 Total)

1. **SETUP-001**: Platform Setup Page Layout
2. **SETUP-002**: Storage Bucket Setup (Supabase storage configuration)
3. **SETUP-003**: Email Configuration (SMTP settings verification)
4. **SETUP-004**: Database Schema Verification
5. **SETUP-005**: RLS Policy Health Check
6. **SETUP-006**: Migration Runner Interface
7. **SETUP-007**: Environment Variables Checker
8. **SETUP-008**: API Integration Testing (Stripe, SendGrid, etc.)
9. **SETUP-009**: System Status Dashboard
10. **SETUP-010**: Automated Setup Wizard

---

## Critical Setup Actions

### Storage Bucket Setup
```sql
-- Creates training-content bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('training-content', 'training-content', true);

-- Set policies
CREATE POLICY "Public read access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'training-content');
```

### Email Verification
Tests SMTP configuration and sends test email.

### Database Health
Verifies all required tables exist with correct schema.

---

## Implementation Summary

See `documentation/03-admin-workflow.md` Section 2.13 for complete specifications.

## Epic Completion Criteria

- [ ] All 10 stories implemented
- [ ] Setup wizard functional
- [ ] All system checks working
- [ ] Configuration saved
- [ ] Status monitoring operational

**Status**: Ready for implementation  
**Prerequisites**: Epic 1 complete  
**Next Epic**: Epic 11 (Media Library - needs storage)

