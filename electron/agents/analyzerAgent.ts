// Analyzer Agent — evaluates SEO, writing quality, and platform algorithm performance
import { generateStream, DEFAULT_MODEL } from '../services/ollamaClient'

export interface AnalyzerAgentInput {
  posts: Array<{ caption: string; hashtags: string[]; platform: string; engagementRate: number }>
  competitorPosts?: Array<{ caption: string; hashtags: string[]; engagementRate: number }>
  platforms: string[]
}

export function buildAnalyzerPrompt(input: AnalyzerAgentInput): string {
  return `You are an expert social media content analyzer. Analyze the following posts and provide a structured JSON report.

POSTS TO ANALYZE:
${JSON.stringify(input.posts, null, 2)}

${input.competitorPosts ? `COMPETITOR POSTS:\n${JSON.stringify(input.competitorPosts, null, 2)}` : ''}

PLATFORMS: ${input.platforms.join(', ')}

Respond ONLY with valid JSON in this exact format:
{
  "seoScore": <0-100>,
  "readabilityScore": <0-100>,
  "hashtagEffectiveness": <0-100>,
  "algorithmAlignmentScore": <0-100>,
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "topPerformingPatterns": ["pattern1", "pattern2"]
}`
}

export async function* runAnalyzerAgent(
  input: AnalyzerAgentInput,
  model = DEFAULT_MODEL
): AsyncGenerator<string> {
  const prompt = buildAnalyzerPrompt(input)
  yield* generateStream(model, prompt, { temperature: 0.3 })
}
