import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});
const PROJECT_DOC_SYSTEM_PROMPT = `You are a Guidewire student who has just completed a comprehensive capstone project.
YOUR ROLE:
- Write complete, realistic project documentation as if YOU built this project
- Act as the student/developer who implemented everything
- Use first-person narrative ("I designed...", "I implemented...", "In my implementation...")
- Show deep understanding through technical details
DOCUMENTATION STRUCTURE:
1. **Executive Summary**
   - Business problem addressed
   - Solution overview
   - Key achievements with metrics
2. **Project Overview**
   - Background and context
   - Objectives and goals
   - Stakeholders
   - Timeline
3. **Technical Architecture**
   - System design
   - Data model (entities, relationships)
   - Integration architecture
   - Technology stack with versions
4. **Implementation Details**
   - Key features developed
   - PCF customizations (with examples)
   - GOSU code snippets (with explanations)
   - Business rules and workflows
   - Integrations (REST/SOAP endpoints)
5. **Challenges & Solutions**
   - Technical challenges faced
   - How you solved them
   - Lessons learned
   - Best practices applied
6. **Testing & Quality Assurance**
   - Testing approach
   - Test scenarios
   - Quality metrics
7. **Results & Impact**
   - Quantifiable outcomes
   - Business value delivered
   - Performance improvements
   - User feedback
8. **Future Enhancements**
   - Potential improvements
   - Scalability considerations
   - Additional features
WRITING STYLE:
- Professional yet conversational
- Show problem-solving thought process
- Include specific technical details
- Reference Guidewire best practices
- Use industry terminology correctly
- Demonstrate hands-on experience
CODE EXAMPLES:
- Include realistic code snippets
- Add inline comments
- Explain complex logic
- Show before/after comparisons
Make it comprehensive, realistic, and impressive!`;
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { 
      projectName, 
      product, 
      industry, 
      scope, 
      technologies, 
      challenges 
    } = await request.json();
    // Build the detailed prompt
    let prompt = `Create comprehensive project documentation for the following Guidewire implementation:\n\n`;
    prompt += `PROJECT NAME: ${projectName}\n`;
    prompt += `GUIDEWIRE PRODUCT: ${product}\n`;
    if (industry) prompt += `INDUSTRY: ${industry}\n`;
    prompt += `\nPROJECT SCOPE:\n${scope}\n`;
    if (technologies) {
      prompt += `\nTECHNOLOGIES USED:\n${technologies}\n`;
    } else {
      // Provide default tech stack
      prompt += `\nTECHNOLOGIES USED:\n`;
      prompt += `- Guidewire ${product} 10.x\n`;
      prompt += `- GOSU programming language\n`;
      prompt += `- PCF (Page Configuration Files)\n`;
      prompt += `- Guidewire Studio\n`;
      prompt += `- REST/SOAP web services\n`;
      prompt += `- Oracle Database\n`;
      prompt += `- Java 11\n`;
      prompt += `- Git for version control\n`;
      prompt += `- JIRA for project management\n`;
    }
    if (challenges) {
      prompt += `\nKEY CHALLENGES & SOLUTIONS:\n${challenges}\n`;
    }
    prompt += `\nGenerate a complete, professional project documentation in Markdown format.`;
    prompt += `\nInclude code examples, diagrams (using Mermaid syntax if needed), and specific metrics.`;
    prompt += `\nMake it detailed enough that someone could understand the full implementation.`;
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: PROJECT_DOC_SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });
    const documentation = completion.choices[0].message.content;
    return NextResponse.json({
      success: true,
      documentation,
      metadata: {
        projectName,
        product,
        generatedAt: new Date().toISOString(),
        wordCount: documentation?.split(/\s+/).length || 0
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
