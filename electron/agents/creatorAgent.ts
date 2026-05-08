// Creator Agent — produces platform-optimized captions, hashtags, video scripts
import { generateStream, DEFAULT_MODEL } from '../services/ollamaClient'

export interface CreatorAgentInput {
  topic: string
  platform: string
  tone: string
  targetAudience: string
  language: string
  includeVideoScript: boolean
}

export function buildCreatorPrompt(input: CreatorAgentInput): string {
  return `You are an expert social media content creator. Create optimized content for ${input.platform}.

TOPIC: ${input.topic}
TONE: ${input.tone}
TARGET AUDIENCE: ${input.targetAudience}
LANGUAGE: ${input.language}
PLATFORM: ${input.platform}
${input.includeVideoScript ? 'INCLUDE: video script' : ''}

Platform constraints:
- Twitter/X: max 280 characters
- Instagram: max 2200 characters, max 30 hashtags
- TikTok: max 2200 characters
- LinkedIn: max 3000 characters, professional tone
- YouTube: max 5000 characters description

Respond ONLY with valid JSON in this exact format:
{
  "caption": "<optimized caption>",
  "hashtags": ["#tag1", "#tag2"],
  "videoScript": "<script if requested, otherwise null>",
  "visualRecommendations": ["recommendation1", "recommendation2"],
  "alternativeVersions": ["<alternative caption 1>", "<alternative caption 2>"]
}`
}

export async function* runCreatorAgent(
  input: CreatorAgentInput,
  model = DEFAULT_MODEL
): AsyncGenerator<string> {
  const prompt = buildCreatorPrompt(input)
  yield* generateStream(model, prompt, { temperature: 0.7 })
}
