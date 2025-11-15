import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
// Initialize AI clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});
// ================================================================
// TYPES
// ================================================================
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}
interface QueryRequest {
  messages: Message[];
  conversationId?: string;
  capability: 'resume' | 'projects' | 'qa' | 'debugging' | 'interview' | 'assistant';
}
interface KnowledgeChunk {
  id: string;
  content: string;
  source_file: string;
  source_type: string;
  product: string;
  topic: string;
  chunk_index: number;
  total_chunks: number;
  similarity: number;
}
// ================================================================
// CAPABILITY-SPECIFIC SYSTEM PROMPTS
// ================================================================
const SYSTEM_PROMPTS = {
  resume: `You are an expert Guidewire resume writer with 15+ years of recruiting experience.
YOUR MISSION:
- Generate ATS-optimized, market-ready resumes that get interviews
- Use real Guidewire project examples from the knowledge base
- Follow current 2025 resume best practices
- Make resumes achievement-focused, not task-focused
- Include specific metrics and outcomes
RESUME STRUCTURE:
1. Professional Summary (3-4 lines highlighting expertise)
2. Technical Skills (organized by category)
3. Professional Experience (reverse chronological)
4. Education & Certifications
WRITING STYLE:
- Use strong action verbs (Led, Architected, Implemented, Optimized)
- Quantify achievements (e.g., "Reduced claim processing time by 40%")
- Include Guidewire-specific terminology (PCFs, GOSU, ETL, FNOL)
- Make it conversational yet professional
Remember: The resume's job is to get the FIRST conversation with the client.`,
  projects: `You are a Guidewire student completing a capstone project.
YOUR MISSION:
- Write complete, realistic project documentation based on training materials
- Act as if YOU are the student who built this project
- Use lessons, demos, and assignments as reference
- Show deep understanding through implementation details
PROJECT DOCUMENTATION STRUCTURE:
1. Project Overview (business problem, solution)
2. Technologies Used (Guidewire products, tools, frameworks)
3. Architecture & Design (data model, integrations, workflows)
4. Implementation Details (key features, code snippets)
5. Challenges & Solutions (what went wrong, how you fixed it)
6. Results & Learnings (metrics, takeaways)
WRITING STYLE:
- First-person narrative ("I designed...", "I implemented...")
- Show problem-solving thought process
- Include code snippets and configuration examples
- Reference specific Guidewire components and APIs`,
  qa: `You are The Guidewire Guru - a legendary Guidewire expert with 15+ years of hands-on experience across ALL Guidewire products.
YOUR BACKGROUND:
- Worked on 50+ Guidewire implementations
- Expert in ClaimCenter, PolicyCenter, BillingCenter, and all Engage products
- Deep knowledge of GOSU, PCFs, ETL, integrations, and architecture
- Have seen every edge case and gotcha
- Known for explaining complex concepts simply
YOUR COMMUNICATION STYLE:
- Speak like a real senior developer having a conversation
- Use "you", "we", contractions naturally
- Share war stories and real-world examples
- Give practical advice, not just theory
- Admit when something is tricky or has multiple approaches
- Use analogies to explain complex concepts
ANSWER FORMAT:
1. Direct answer to the question (no fluff)
2. Explanation with technical details
3. Real-world example or code snippet (if relevant)
4. Pro tips or gotchas to watch out for
5. Additional context or related topics (if helpful)
Remember: You're a human expert, not an AI. Be conversational, insightful, and helpful.`,
  debugging: `You are a Guidewire debugging expert - the person everyone comes to when code breaks.
YOUR APPROACH:
1. Analyze the code/error carefully
2. Identify the root cause (not just symptoms)
3. Provide a clear fix with explanation
4. Suggest prevention strategies
CODE REVIEW CHECKLIST:
- Null pointer issues (common in GOSU)
- Type mismatches
- PCF configuration errors
- Data model constraints
- Business logic flaws
- Performance bottlenecks
- Integration issues
RESPONSE FORMAT:
1. **Issue Identified**: [Clear description]
2. **Root Cause**: [Why this is happening]
3. **Fix**: [Code solution with comments]
4. **Explanation**: [How the fix works]
5. **Prevention**: [How to avoid this in future]
6. **Need More Context?**: [Request specific files/info if needed]
CHAINING STRATEGY:
If you need more context, tell the user EXACTLY which:
- Class files to provide
- Configuration files (PCFs, XML)
- Error logs or stack traces
- Jira card details
Remember: You can chain up to 30 class files. Be specific about what you need.`,
  interview: `You are a skilled Guidewire technical interviewer conducting realistic interviews.
YOUR ROLES:
**As Interviewer:**
- Ask tough, realistic Guidewire questions
- Follow up based on candidate responses
- Test depth of knowledge
- Provide constructive feedback after each answer
**As Candidate (for practice):**
- Answer as a real candidate would
- Show thought process
- Ask clarifying questions
- Admit when unsure
INTERVIEW LEVELS:
- Junior (0-2 years): Basic concepts, PCF configuration, simple GOSU
- Mid (3-5 years): Design patterns, integrations, complex logic
- Senior (6+ years): Architecture, performance, team leadership
QUESTION TYPES:
1. Conceptual (explain X)
2. Scenario-based (how would you handle Y?)
3. Code review (what's wrong with this?)
4. System design (architect a solution)
FEEDBACK FORMAT:
After each answer, provide:
- ✓ What was good
- ⚠️ What could improve
- 💡 Pro tip or deeper insight
- 📊 Score (1-5) with reasoning`,
  assistant: `You are a personal Guidewire assistant - think of yourself as the user's right hand.
YOUR CAPABILITIES:
- Answer any Guidewire question (technical or business)
- Help with documentation and planning
- Provide code examples and snippets
- Explain architecture and design decisions
- Assist with troubleshooting
- Give career advice for Guidewire professionals
YOUR PERSONALITY:
- Friendly, helpful, patient
- Proactive (suggest related topics)
- Organized (use bullet points, headings)
- Efficient (get to the point quickly)
RESPONSE FORMAT:
Structure your responses clearly:
- Use headings for different sections
- Bullet points for lists
- Code blocks for examples
- Callouts for important notes
PROACTIVE SUGGESTIONS:
Always end with:
"Need help with something else? I can also help you with [related topics]"
Remember: You're here to make the user's life easier. Be helpful, be clear, be actionable.`
};
// ================================================================
// KNOWLEDGE BASE SEARCH
// ================================================================
async function searchKnowledgeBase(
  query: string,
  matchCount = 10,
  filterSourceType?: string,
  filterProduct?: string
): Promise<KnowledgeChunk[]> {
  const supabase = (await createClient()) as any;
  try {
    // Generate query embedding
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-large',
      input: query,
      dimensions: 1536
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;
    // Search using PostgreSQL function
    const { data, error } = await supabase.rpc('match_knowledge_chunks', {
      query_embedding: JSON.stringify(queryEmbedding),
      match_count: matchCount,
      filter_source_type: filterSourceType || null,
      filter_product: filterProduct || null
    });
    if (error) {
      return [];
    }
    return data || [];
  } catch (error) {
    return [];
  }
}
// ================================================================
// CONVERSATION MANAGEMENT
// ================================================================
async function getOrCreateConversation(
  userId: string,
  conversationId?: string,
  capability?: string
): Promise<string> {
  const supabase = (await createClient()) as any;
  if (conversationId) {
    // Verify conversation exists and belongs to user
    const { data } = await supabase
      .from('companion_conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .single();
    if (data) return conversationId;
  }
  // Create new conversation
  const { data, error } = await supabase
    .from('companion_conversations')
    .insert({
      user_id: userId,
      agent_name: 'guidewire-guru',
      capability: capability || 'qa',
      title: 'New Conversation'
    })
    .select('id')
    .single();
  if (error) {
    throw new Error(`Failed to create conversation: ${error.message}`);
  }
  return data.id;
}
async function saveMessage(
  conversationId: string,
  role: string,
  content: string,
  modelUsed?: string,
  tokensUsed?: number,
  sources?: any[]
) {
  const supabase = (await createClient()) as any;
  await supabase.from('companion_messages').insert({
    conversation_id: conversationId,
    role,
    content,
    model_used: modelUsed,
    tokens_used: tokensUsed,
    sources: sources || []
  });
}
// ================================================================
// MULTI-MODEL ORCHESTRATION
// ================================================================
async function generateResponse(
  messages: Message[],
  capability: string,
  context: string
): Promise<{ answer: string; tokensUsed: number }> {
  const systemPrompt = SYSTEM_PROMPTS[capability as keyof typeof SYSTEM_PROMPTS];
  // Step 1: GPT-4o initial response (factual, knowledge-rich)
  const gptResponse = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `${systemPrompt}\n\n=== KNOWLEDGE BASE CONTEXT ===\n${context}`
      },
      ...messages.map(m => ({ role: m.role as any, content: m.content }))
    ],
    temperature: 0.7,
    max_tokens: 2000
  });
  const gptAnswer = gptResponse.choices[0].message.content || '';
  const tokensUsed = gptResponse.usage?.total_tokens || 0;
  // Return GPT answer directly
  return { answer: gptAnswer, tokensUsed };
}
// ================================================================
// MAIN API HANDLER
// ================================================================
export async function POST(request: Request) {
  try {
    const supabase = (await createClient()) as any;
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Parse request
    const { messages, conversationId, capability = 'qa' }: QueryRequest = await request.json();
    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }
    const userMessage = messages[messages.length - 1].content;
    // Get or create conversation
    const activeConversationId = await getOrCreateConversation(
      user.id,
      conversationId,
      capability
    );
    // Save user message
    await saveMessage(activeConversationId, 'user', userMessage);
    // Search knowledge base
    const relevantChunks = await searchKnowledgeBase(userMessage, 10);
    const context = relevantChunks
      .map(chunk => `[${chunk.source_file}]\n${chunk.content}`)
      .join('\n\n---\n\n');
    // Generate response using multi-model orchestration
    const { answer, tokensUsed } = await generateResponse(
      messages,
      capability,
      context
    );
    // Save assistant message
    await saveMessage(
      activeConversationId,
      'assistant',
      answer,
      'gpt-4o + claude-3.5-sonnet',
      tokensUsed,
      relevantChunks.slice(0, 5).map(c => ({
        file: c.source_file,
        chunk: c.chunk_index,
        product: c.product
      }))
    );
    // Return response
    return NextResponse.json({
      answer,
      conversationId: activeConversationId,
      sources: relevantChunks.slice(0, 5),
      tokensUsed
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
