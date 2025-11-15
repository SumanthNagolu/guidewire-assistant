import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
const emailTemplates = {
  candidate_outreach: {
    subject: 'Exciting {position} Opportunity at {company}',
    body: `Dear {candidateName},
I hope this email finds you well. I came across your profile and was impressed by your experience in {skills}.
I'm reaching out regarding an exciting opportunity for a {position} position with our client, {company}. This role offers:
• {keyPoint1}
• {keyPoint2}
• {keyPoint3}
The position requires {experience} years of experience with {requiredSkills}, which aligns perfectly with your background.
Would you be available for a brief call this week to discuss this opportunity further? I'd love to learn more about your career goals and share additional details about this role.
Please let me know your availability, and I'll be happy to schedule a call at your convenience.
Best regards,
{senderName}
{senderTitle}
{senderCompany}
{senderPhone}`
  },
  client_communication: {
    subject: 'Update on {position} - Candidate Submissions',
    body: `Dear {clientName},
I hope you're having a great week. I wanted to provide you with an update on the {position} position.
We've made excellent progress in identifying qualified candidates:
• Total candidates screened: {screenedCount}
• Qualified candidates identified: {qualifiedCount}
• Submissions ready for your review: {submittedCount}
Top candidates submitted:
{candidateList}
Each candidate has been thoroughly vetted against your requirements, including:
• {requirement1}
• {requirement2}
• {requirement3}
I've attached the detailed profiles for your review. Please let me know if you'd like to schedule interviews with any of these candidates, and I'll coordinate with their schedules immediately.
Thank you for your continued partnership. I'm confident we'll find the perfect fit for your team.
Best regards,
{senderName}
{senderTitle}
{senderCompany}`
  },
  status_update: {
    subject: 'Status Update - {candidateName} for {position}',
    body: `Dear {recipientName},
I wanted to provide you with a quick update on {candidateName}'s application for the {position} role.
Current Status: {currentStatus}
Recent Activity:
• {activity1}
• {activity2}
• {activity3}
Next Steps:
{nextSteps}
Expected Timeline: {timeline}
Please let me know if you need any additional information or if there's anything specific you'd like me to follow up on.
Best regards,
{senderName}
{senderTitle}`
  },
  follow_up: {
    subject: 'Following Up - {position} Opportunity',
    body: `Hi {recipientName},
I wanted to follow up on my previous email regarding the {position} opportunity.
I understand you may be busy, but I wanted to ensure you had a chance to review this exciting opportunity. To recap:
• Position: {position}
• Location: {location}
• Salary Range: {salaryRange}
• Key Benefits: {benefits}
This position is moving quickly, and I'd hate for you to miss out on this opportunity. Would you have 10 minutes this week for a brief call?
If you're not interested, please let me know so I can update my records accordingly.
Looking forward to hearing from you.
Best regards,
{senderName}
{senderTitle}`
  },
  interview_schedule: {
    subject: 'Interview Scheduled - {candidateName} for {position}',
    body: `Dear {recipientName},
Great news! Your interview has been scheduled for the {position} position at {company}.
Interview Details:
• Date: {interviewDate}
• Time: {interviewTime}
• Duration: {duration}
• Format: {interviewFormat}
• Location/Link: {locationOrLink}
Interviewer(s):
{interviewersList}
Preparation Tips:
• Research {company} and their recent projects
• Prepare examples demonstrating your experience with {keySkills}
• Have questions ready about the role and team
• Test your video/audio setup if virtual
Please confirm your availability by replying to this email. If you need to reschedule, please let me know as soon as possible.
Good luck with your interview!
Best regards,
{senderName}
{senderTitle}`
  },
  offer_letter: {
    subject: 'Congratulations! Job Offer - {position} at {company}',
    body: `Dear {candidateName},
Congratulations! I'm thrilled to inform you that {company} would like to extend an offer for the {position} position.
Offer Details:
• Position: {position}
• Start Date: {startDate}
• Salary: {salary}
• Location: {location}
• Reporting To: {reportingTo}
Benefits Package:
{benefitsList}
This offer is contingent upon:
• Successful completion of background check
• Reference verification
• {additionalContingencies}
Next Steps:
1. Review the attached formal offer letter
2. Sign and return by {deadline}
3. Complete onboarding paperwork
This is an exciting opportunity, and the team is looking forward to having you on board. Please let me know if you have any questions or would like to discuss any aspect of the offer.
Congratulations again!
Best regards,
{senderName}
{senderTitle}`
  }
};
export async function POST(request: Request) {
  try {
    const { context, type } = await request.json();
    if (!context || !type) {
      return NextResponse.json({ error: 'Context and type are required' }, { status: 400 });
    }
    const template = emailTemplates[type as keyof typeof emailTemplates];
    if (!template) {
      return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
    }
    // Parse context and fill template
    const parsedContext = parseContext(context);
    let subject = template.subject;
    let body = template.body;
    // Replace placeholders with actual values
    Object.entries(parsedContext).forEach(([key, value]) => {
      const regex = new RegExp(`{${key}}`, 'g');
      subject = subject.replace(regex, value as string);
      body = body.replace(regex, value as string);
    });
    // Fill in any remaining placeholders with defaults
    subject = fillDefaults(subject, type);
    body = fillDefaults(body, type);
    // Store the generated email template for future use
    const supabase = createServerComponentClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Save as communication template
      await supabase.from('communication_templates').insert({
        name: `Generated: ${type} - ${new Date().toISOString()}`,
        category: type,
        subject,
        body,
        variables: Object.keys(parsedContext),
        ai_enhanced: true,
        ai_suggestions: { context: parsedContext },
        created_by: user.id,
        is_public: false,
      });
    }
    return NextResponse.json({
      subject,
      body,
      type,
      context: parsedContext,
      suggestions: generateSuggestions(type, parsedContext),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate email' }, { status: 500 });
  }
}
function parseContext(context: string): Record<string, string> {
  const parsed: Record<string, string> = {};
  // Extract common patterns from context
  const patterns = {
    candidateName: /candidate:?\s*([A-Za-z\s]+?)(?:[,\n]|$)/i,
    position: /position:?\s*([^,\n]+?)(?:[,\n]|$)/i,
    company: /company:?\s*([^,\n]+?)(?:[,\n]|$)/i,
    location: /location:?\s*([^,\n]+?)(?:[,\n]|$)/i,
    salary: /salary:?\s*([^,\n]+?)(?:[,\n]|$)/i,
    experience: /experience:?\s*([^,\n]+?)(?:[,\n]|$)/i,
    skills: /skills:?\s*([^,\n]+?)(?:[,\n]|$)/i,
  };
  Object.entries(patterns).forEach(([key, pattern]) => {
    const match = context.match(pattern);
    if (match) {
      parsed[key] = match[1].trim();
    }
  });
  // Add default sender information
  parsed.senderName = parsed.senderName || 'Recruiting Team';
  parsed.senderTitle = parsed.senderTitle || 'Senior Recruiter';
  parsed.senderCompany = parsed.senderCompany || 'InTime Solutions';
  parsed.senderPhone = parsed.senderPhone || '(555) 123-4567';
  // Parse any key-value pairs in the context
  const lines = context.split('\n');
  lines.forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim().replace(/\s+/g, '');
      const value = line.substring(colonIndex + 1).trim();
      if (key && value) {
        parsed[key] = value;
      }
    }
  });
  return parsed;
}
function fillDefaults(text: string, type: string): string {
  const defaults: Record<string, string> = {
    candidateName: '[Candidate Name]',
    position: '[Position Title]',
    company: '[Company Name]',
    clientName: '[Client Name]',
    recipientName: '[Recipient]',
    location: '[Location]',
    salaryRange: '[Salary Range]',
    experience: '[Years of Experience]',
    skills: '[Required Skills]',
    requiredSkills: '[Required Skills]',
    keyPoint1: '[Key Point 1]',
    keyPoint2: '[Key Point 2]',
    keyPoint3: '[Key Point 3]',
    screenedCount: '[Number]',
    qualifiedCount: '[Number]',
    submittedCount: '[Number]',
    candidateList: '[Candidate List]',
    requirement1: '[Requirement 1]',
    requirement2: '[Requirement 2]',
    requirement3: '[Requirement 3]',
    currentStatus: '[Current Status]',
    activity1: '[Recent Activity]',
    activity2: '[Recent Activity]',
    activity3: '[Recent Activity]',
    nextSteps: '[Next Steps]',
    timeline: '[Timeline]',
    benefits: '[Benefits]',
    interviewDate: '[Interview Date]',
    interviewTime: '[Interview Time]',
    duration: '[Duration]',
    interviewFormat: '[Virtual/In-person]',
    locationOrLink: '[Location or Meeting Link]',
    interviewersList: '[Interviewer Names and Titles]',
    keySkills: '[Key Skills]',
    startDate: '[Start Date]',
    salary: '[Salary]',
    reportingTo: '[Manager Name]',
    benefitsList: '[Benefits List]',
    additionalContingencies: '[Additional Requirements]',
    deadline: '[Deadline Date]',
  };
  let result = text;
  Object.entries(defaults).forEach(([key, value]) => {
    const regex = new RegExp(`{${key}}`, 'g');
    result = result.replace(regex, value);
  });
  return result;
}
function generateSuggestions(type: string, context: Record<string, string>): string[] {
  const suggestions: string[] = [];
  switch (type) {
    case 'candidate_outreach':
      suggestions.push('Personalize the opening with specific details from their profile');
      suggestions.push("Mention 2-3 specific technologies they've worked with");
      suggestions.push('Include the salary range if competitive');
      suggestions.push('Suggest 2-3 specific time slots for the call');
      break;
    case 'client_communication':
      suggestions.push('Include specific metrics about candidate quality');
      suggestions.push('Highlight any standout candidates');
      suggestions.push('Mention expected interview timeline');
      break;
    case 'follow_up':
      suggestions.push('Keep it brief and to the point');
      suggestions.push('Create urgency without being pushy');
      suggestions.push('Offer an easy opt-out option');
      break;
    case 'interview_schedule':
      suggestions.push('Include interviewer LinkedIn profiles');
      suggestions.push('Attach job description for reference');
      suggestions.push('Include parking/building access instructions if in-person');
      break;
  }
  return suggestions;
}
