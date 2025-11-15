#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 TRIKALA PLATFORM - PRODUCTION READINESS VERIFICATION');
console.log('=========================================================\n');

let totalChecks = 0;
let passedChecks = 0;
let warnings = [];
let errors = [];

// Check function
function check(name, condition, isWarning = false) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`✅ ${name}`);
  } else if (isWarning) {
    warnings.push(name);
    console.log(`⚠️  ${name} (Warning)`);
  } else {
    errors.push(name);
    console.log(`❌ ${name}`);
  }
}

// Check file existence
function fileExists(filePath) {
  return fs.existsSync(path.join(process.cwd(), filePath));
}

console.log('📁 CHECKING CORE FILES...');
console.log('-------------------------');
check('Database schema exists', fileExists('database/MASTER_SCHEMA_V1.sql'));
check('Package.json exists', fileExists('package.json'));
check('TypeScript config exists', fileExists('tsconfig.json'));
check('Next.js config exists', fileExists('next.config.ts'));
check('Tailwind config exists', fileExists('tailwind.config.ts'));
check('Environment template exists', fileExists('env.template') || fileExists('.env.example'));

console.log('\n🧠 CHECKING AI SYSTEM...');
console.log('------------------------');
check('AI Orchestrator exists', fileExists('lib/ai/orchestrator.ts'));
check('AI Learning System exists', fileExists('lib/ai/learning-system.ts'));
check('AI Feedback System exists', fileExists('lib/ai/feedback-system.ts'));
check('AI Context Manager exists', fileExists('lib/ai/context-manager.ts'));
check('AI Response Validator exists', fileExists('lib/ai/response-validator.ts'));
check('AI A/B Testing exists', fileExists('lib/ai/ab-testing.ts'));
check('Unified AI Service exists', fileExists('lib/ai/unified-service.ts'));

console.log('\n🔧 CHECKING SERVICES...');
console.log('----------------------');
check('Unified User Service exists', fileExists('lib/users/unified-user-service.ts'));
check('Event Bus exists', fileExists('lib/events/event-bus.ts'));
check('Email Service exists', fileExists('lib/services/email-service.ts'));
check('Calendar Service exists', fileExists('lib/services/calendar-service.ts'));
check('Document Service exists', fileExists('lib/services/document-service.ts'));
check('Redis/Cache setup exists', fileExists('lib/redis.ts'));
check('Logger setup exists', fileExists('lib/logger.ts'));

console.log('\n🤖 CHECKING ML/ANALYTICS...');
console.log('--------------------------');
check('Prediction Engine exists', fileExists('lib/ml/prediction-engine.ts'));
check('Optimization Service exists', fileExists('lib/ml/optimization-service.ts'));
check('Business Metrics Service exists', fileExists('lib/analytics/business-metrics.ts'));

console.log('\n📊 CHECKING CEO DASHBOARD...');
console.log('---------------------------');
check('CEO Dashboard page exists', fileExists('app/(ceo)/ceo/dashboard/page.tsx'));
check('CEO Dashboard API exists', fileExists('app/api/ceo/dashboard/route.ts'));

console.log('\n🔐 CHECKING MONITORING...');
console.log('------------------------');
check('Sentry client config exists', fileExists('sentry.client.config.ts'));
check('Sentry server config exists', fileExists('sentry.server.config.ts'));
check('Google Analytics component exists', fileExists('components/analytics/GoogleAnalytics.tsx'));

console.log('\n🚀 CHECKING CI/CD...');
console.log('-------------------');
check('CI workflow exists', fileExists('.github/workflows/ci.yml'));
check('Deploy workflow exists', fileExists('.github/workflows/deploy.yml'));

console.log('\n📝 CHECKING DOCUMENTATION...');
console.log('--------------------------');
check('README exists', fileExists('README.md'));
check('Production checklist exists', fileExists('TRIKALA-PRODUCTION-CHECKLIST.md'));
check('Implementation summary exists', fileExists('IMPLEMENTATION-COMPLETE-SUMMARY.md'));

console.log('\n🔍 CHECKING PACKAGE.JSON...');
console.log('--------------------------');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
check('Has build script', !!packageJson.scripts?.build);
check('Has start script', !!packageJson.scripts?.start);
check('Has dev script', !!packageJson.scripts?.dev);
check('Has TypeScript dependency', !!packageJson.devDependencies?.typescript);
check('Has Next.js dependency', !!packageJson.dependencies?.next);
check('Has Supabase client', !!packageJson.dependencies?.['@supabase/supabase-js']);

console.log('\n🌐 CHECKING ENVIRONMENT VARIABLES...');
console.log('------------------------------------');
if (fileExists('.env.local') || fileExists('.env')) {
  console.log('⚠️  Environment file found - ensure all secrets are configured');
  warnings.push('Verify all environment variables are set');
} else {
  console.log('📝 No .env file found - will need to be created for deployment');
  warnings.push('Create .env file with production values');
}

// Final Summary
console.log('\n' + '='.repeat(60));
console.log('📊 VERIFICATION SUMMARY');
console.log('='.repeat(60));
console.log(`Total Checks: ${totalChecks}`);
console.log(`Passed: ${passedChecks}`);
console.log(`Warnings: ${warnings.length}`);
console.log(`Errors: ${errors.length}`);
console.log('');

if (warnings.length > 0) {
  console.log('⚠️  WARNINGS:');
  warnings.forEach(w => console.log(`   - ${w}`));
  console.log('');
}

if (errors.length > 0) {
  console.log('❌ ERRORS TO FIX:');
  errors.forEach(e => console.log(`   - ${e}`));
  console.log('');
}

// Calculate readiness percentage
const readinessScore = Math.round((passedChecks / totalChecks) * 100);

console.log('='.repeat(60));
if (readinessScore >= 95) {
  console.log(`✅ PRODUCTION READINESS: ${readinessScore}% - READY TO DEPLOY!`);
  console.log('🚀 The Trikala Platform is ready for production deployment.');
} else if (readinessScore >= 80) {
  console.log(`⚠️  PRODUCTION READINESS: ${readinessScore}% - ALMOST READY`);
  console.log('📝 Address the remaining issues before deployment.');
} else {
  console.log(`❌ PRODUCTION READINESS: ${readinessScore}% - NOT READY`);
  console.log('🔧 Significant work needed before production deployment.');
}
console.log('='.repeat(60));

// Exit with appropriate code
process.exit(errors.length > 0 ? 1 : 0);
