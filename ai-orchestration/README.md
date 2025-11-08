# 🎯 AI Orchestration Tool

Multi-model AI orchestration tool for superior planning and decision-making.

## Features

- **Multi-Model Querying:** Query GPT-4o, Claude 3.5 Sonnet, and Gemini Pro simultaneously
- **AI Synthesis:** Automatically combine the best ideas from all models into a superior response
- **Cost Tracking:** See exactly how much each query costs
- **Response Comparison:** Compare individual model responses side-by-side
- **Knowledge Base:** Save important decisions and responses for future reference

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Keys

Create a `.env.local` file:

```bash
cp .env.example .env.local
```

Add your API keys:
```env
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_AI_API_KEY=your_google_key
```

**Get API Keys:**
- OpenAI: https://platform.openai.com/api-keys
- Anthropic: https://console.anthropic.com/
- Google AI: https://makersuite.google.com/app/apikey

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001)

## Usage

1. **Enter your query** - Ask any planning, architecture, or design question
2. **Add context** (optional) - Provide project context for better responses
3. **Select models** - Choose which AI models to query
4. **Enable synthesis** - Get a combined best-of-all-models response
5. **Submit** - Wait 10-30 seconds for all models to respond
6. **Review results** - Compare individual responses and synthesized output
7. **Copy to Cursor** - Use the synthesized response in Cursor for implementation

## Cost Per Query

| Model | Input (per 1M tokens) | Output (per 1M tokens) | Typical Query Cost |
|-------|----------------------|------------------------|-------------------|
| GPT-4o | $2.50 | $10.00 | ~$0.02 |
| Claude Sonnet | $3.00 | $15.00 | ~$0.15 |
| Gemini Pro | $1.25 | $5.00 | ~$0.10 |
| Synthesis | $2.50 | $10.00 | ~$0.02 |
| **Total** | | | **~$0.30** |

## Example Queries

### Architecture Design
```
Design a complete database schema for a multi-business staffing platform 
that includes Training, Recruiting, Bench Sales, and Talent Acquisition units.
```

### Technical Planning
```
What's the optimal tech stack for building a real-time job portal 
with AI-powered resume matching and automated email notifications?
```

### Integration Strategy
```
How should I integrate Monday.com, LinkedIn API, and multiple job boards 
into a unified recruiting platform?
```

## Integration with Cursor

### Manual (Current)
1. Get synthesized response
2. Click "Copy to Clipboard"
3. Paste into Cursor with context

### Future: Direct API
We'll add direct Cursor integration once available.

## Architecture

```
Frontend (Next.js)
    ↓
API Route (/api/orchestrate)
    ↓
Parallel Model Calls
    ├─ GPT-4o
    ├─ Claude Sonnet
    └─ Gemini Pro
    ↓
Synthesis Engine (GPT-4o)
    ↓
Combined Response
```

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **AI SDKs:** OpenAI, Anthropic, Google Generative AI
- **Markdown:** React Markdown

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Future Enhancements

- [ ] Streaming responses (real-time)
- [ ] Knowledge base with search
- [ ] Query history and favorites
- [ ] Custom model selection logic
- [ ] Team collaboration features
- [ ] Direct Cursor API integration
- [ ] Export to various formats

## License

Proprietary - IntimeEsolutions

---

**Built for:** Planning and decision-making for IntimeEsolutions Platform  
**Purpose:** Get the best AI insights before implementing with Cursor

