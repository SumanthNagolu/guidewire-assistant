'use server';

// Stub file for interview simulator actions
export async function submitInterviewSession() {
  return { success: true };
}

export async function getInterviewTemplate() {
  return { success: true, data: {} };
}

export async function startInterview() {
  return { success: true, sessionId: 'test-session' };
}

export async function finalizeInterview() {
  return { success: true };
}

