export const aiStack = {
  Models: [
    'Claude 4.x',
    'GPT-5 / GPT-4o',
    'Deepgram (ASR)',
    'Whisper',
    'ElevenLabs (TTS)',
    'DeepSeek',
    'Qwen3 (fine-tuned)',
    'Llama',
    'BGE-M3 embeddings',
  ],
  Patterns: [
    'RAG (hybrid vector + FTS)',
    'LLM fine-tuning + adapters',
    'Natural-language → SQL',
    'Multi-agent workflows',
    'Tool use & function calling',
    'Prompt caching',
    'Streaming responses',
    'Eval-driven development',
  ],
  Tools: [
    'Claude Code (daily)',
    'Cursor',
    'Anthropic SDK',
    'OpenAI SDK',
    'LanceDB',
    'Hugging Face',
    'LangChain',
    'llama.cpp / MLX',
  ],
}

export type AISystem = {
  id: string
  title: string
  oneLiner: string
  tags: string[]
  status: 'production' | 'showcased' | 'internal'
}

export const aiSystems: AISystem[] = [
  {
    id: 'insight-draft-ai',
    title: 'Insight Draft',
    oneLiner:
      'Multi-provider production AI: GPT-5-mini + Claude 3.5 + Deepgram. RAG Q&A with citations, AI summaries with topic chapters, conversation analytics, AI quick actions, and real-time speaker-attributed captions. Custom prompt framework runs background via Hangfire jobs.',
    tags: ['Deepgram', 'OpenAI', 'Claude', 'RAG', 'vector stores', 'analytics'],
    status: 'production',
  },
  {
    id: 'sql-copilot',
    title: 'SQL AI Copilot · Data Virtuality Platform',
    oneLiner:
      'Cursor-style AI assistant built into the Data Virtuality Platform itself. Steers SQL authoring, edits, and exploration over federated data via natural language. Solo authorship inside the AI research team.',
    tags: ['SQL copilot', 'OpenAI', 'data virtualization', 'solo'],
    status: 'production',
  },
  {
    id: 'talk-to-your-data',
    title: 'Talk to your Data · CData Virtuality',
    oneLiner:
      'Natural-language → governed SQL across federated data sources. Combines an LLM, a semantic vector DB, and the platform’s Virtual SQL engine. Co-built (team of 2) inside CData’s AI research team. Demoed at Gartner D&A Summit 2025.',
    tags: ['NL→SQL', 'RAG', 'semantic layer', 'AI research', 'team of 2'],
    status: 'showcased',
  },
]

export const statusColors: Record<AISystem['status'], string> = {
  production: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400',
  showcased: 'border-violet-500/30 bg-violet-500/5 text-violet-400',
  internal: 'border-sky-500/30 bg-sky-500/5 text-sky-400',
}
