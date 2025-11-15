import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});
interface DebugRequest {
  code: string;
  fileType: 'gosu' | 'pcf' | 'xml' | 'java' | 'javascript';
  fileName?: string;
  analysisType: 'quick' | 'full';
  errorMessage?: string;
  stackTrace?: string;
}
const DEBUG_SYSTEM_PROMPT = `You are The Guidewire Guru - a legendary debugging expert with 15+ years of experience.
YOUR DEBUGGING EXPERTISE:
- Deep understanding of Guidewire products (ClaimCenter, PolicyCenter, BillingCenter)
- Expert in GOSU language, PCF configurations, XML config
- Experience with common Guidewire gotchas and edge cases
- Strong knowledge of Java, integrations, and performance optimization
ANALYSIS APPROACH:
1. Identify all issues (errors, warnings, potential bugs)
2. Explain root causes clearly
3. Provide specific fixes with code examples
4. Suggest optimizations and best practices
5. Point out potential edge cases
RESPONSE FORMAT:
Return a JSON object with:
{
  "issues": [
    {
      "severity": "error" | "warning" | "info",
      "line": number (if applicable),
      "message": "Clear description of the issue",
      "fix": "Code snippet or specific fix"
    }
  ],
  "suggestions": ["List of improvement suggestions"],
  "optimizations": ["Performance and code quality optimizations"],
  "fullAnalysis": "Detailed markdown analysis with explanations"
}
CODE REVIEW CHECKLIST:
- Null pointer safety (critical in GOSU)
- Type correctness and casting
- PCF configuration errors
- Data model constraints
- Business logic flaws
- Performance bottlenecks
- Security vulnerabilities
- Error handling
- Code maintainability
Be thorough, practical, and provide actionable feedback.`;
const FILE_TYPE_CONTEXT = {
  gosu: `
GOSU-SPECIFIC CHECKS:
- Null safety: Check for proper null checks before dereferencing
- Type system: Verify proper use of generics and type parameters
- Entity queries: Look for N+1 query problems
- Transaction boundaries: Ensure proper bundle wrapping
- Enhancement methods: Verify they follow Guidewire conventions
- Property access: Check for lazy loading issues
`,
  pcf: `
PCF-SPECIFIC CHECKS:
- Widget hierarchy and nesting
- Input validation and value binding
- Visible/editable/available expressions
- Post-on-change and refresh patterns
- Location navigation
- Variable scoping
`,
  xml: `
XML CONFIGURATION CHECKS:
- Schema compliance
- Typelist/typekey references
- Foreign key integrity
- Column types and constraints
- Index definitions
- Proper entity relationships
`,
  java: `
JAVA GUIDEWIRE INTEGRATION CHECKS:
- Proper use of Guidewire APIs
- Plugin implementation correctness
- Gosu-Java interop issues
- Exception handling
- Thread safety in plugins
- Performance considerations
`,
  javascript: `
JAVASCRIPT CHECKS (for UI/Integration):
- API call patterns
- Error handling
- Async/await usage
- Data validation
- Security (XSS, injection)
- Performance optimization
`
};
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body: DebugRequest = await request.json();
    const { code, fileType, fileName, analysisType, errorMessage, stackTrace } = body;
    if (!code || !fileType) {
      return NextResponse.json({ error: 'Code and file type are required' }, { status: 400 });
    }
    // Build the analysis prompt
    let userPrompt = `Analyze this ${fileType.toUpperCase()} code:\n\n`;
    if (fileName) {
      userPrompt += `File: ${fileName}\n\n`;
    }
    userPrompt += `\`\`\`${fileType}\n${code}\n\`\`\`\n\n`;
    if (errorMessage) {
      userPrompt += `Error Message:\n${errorMessage}\n\n`;
    }
    if (stackTrace) {
      userPrompt += `Stack Trace:\n${stackTrace}\n\n`;
    }
    userPrompt += FILE_TYPE_CONTEXT[fileType];
    if (analysisType === 'quick') {
      userPrompt += `\nProvide a QUICK analysis focusing on critical issues only.`;
    } else {
      userPrompt += `\nProvide a COMPREHENSIVE analysis with detailed explanations and examples.`;
    }
    // Call OpenAI for code analysis
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: DEBUG_SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent analysis
      max_tokens: 3000,
      response_format: { type: 'json_object' }
    });
    const analysisText = completion.choices[0].message.content || '{}';
    const analysis = JSON.parse(analysisText);
    // Save the debugging session
    await supabase.from('companion_conversations').insert({
      user_id: user.id,
      agent_name: 'debugging-studio',
      capability: 'debugging',
      title: fileName || `Debug Session - ${fileType}`,
      metadata: {
        fileType,
        codeLength: code.length,
        analysisType
      }
    });
    return NextResponse.json({
      success: true,
      analysis,
      tokensUsed: completion.usage?.total_tokens || 0
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
