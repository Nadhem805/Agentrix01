// Planner Agent — generates intelligent content calendars with optimal posting times
import { generateStream, DEFAULT_MODEL } from '../services/ollamaClient'
import type { AnalyzerAgentInput as _AnalyzerAgentInput } from './analyzerAgent'

export interface PlannerAgentInput {
  analyzerReport: string        // JSON string from Analyzer Agent
  contentGoals: string
  platforms: string[]
  daysAhead: number
  timezone: string
}

export function buildPlannerPrompt(input: PlannerAgentInput): string {
  return `You are an expert social media content strategist. Based on the analysis report below, generate a ${input.daysAhead}-day content calendar.

ANALYZER REPORT:
${input.analyzerReport}

CONTENT GOALS: ${input.contentGoals}
PLATFORMS: ${input.platforms.join(', ')}
TIMEZONE: ${input.timezone}

Respond ONLY with valid JSON in this exact format:
{
  "calendarSlots": [
    {
      "scheduledAt": "<ISO 8601 datetime>",
      "platform": "<platform>",
      "topic": "<topic>",
      "contentType": "<post|reel|story|video|thread>"
    }
  ],
  "topicSuggestions": ["topic1", "topic2", "topic3"],
  "optimalPostingTimes": {
    "<platform>": [{"dayOfWeek": <0-6>, "hour": <0-23>, "engagementScore": <0-100>}]
  }
}`
}

export async function* runPlannerAgent(
  input: PlannerAgentInput,
  model = DEFAULT_MODEL
): AsyncGenerator<string> {
  const prompt = buildPlannerPrompt(input)
  yield* generateStream(model, prompt, { temperature: 0.5 })
}
