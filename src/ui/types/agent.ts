import type { SocialPlatform } from './post'

export type AgentType = 'analyzer' | 'planner' | 'creator'
export type AgentStatus = 'idle' | 'running' | 'completed' | 'failed'
export type ContentTone = 'professional' | 'casual' | 'humorous' | 'inspirational' | 'educational'

// ─── Analyzer ────────────────────────────────────────────────────────────────

export interface AnalyzerInput {
  workspaceId: string
  platforms: SocialPlatform[]
  includeCompetitors: boolean
}

export interface AnalyzerOutput {
  seoScore: number
  readabilityScore: number
  hashtagEffectiveness: number
  algorithmAlignmentScore: number
  suggestions: string[]
  topPerformingPatterns: string[]
}

// ─── Planner ─────────────────────────────────────────────────────────────────

export interface PlannerInput {
  workspaceId: string
  analyzerOutput: AnalyzerOutput
  contentGoals: string
  platforms: SocialPlatform[]
  daysAhead: number
}

export interface ContentCalendarSlot {
  id: string
  workspaceId: string
  scheduledAt: string
  platform: SocialPlatform
  topic: string
  contentType: 'post' | 'reel' | 'story' | 'video' | 'thread'
  postId?: string
  createdByAgentRunId: string
  createdAt: string
}

export interface OptimalTime {
  dayOfWeek: number
  hour: number
  engagementScore: number
}

export interface PlannerOutput {
  calendarSlots: ContentCalendarSlot[]
  topicSuggestions: string[]
  optimalPostingTimes: Partial<Record<SocialPlatform, OptimalTime[]>>
}

// ─── Creator ─────────────────────────────────────────────────────────────────

export interface CreatorInput {
  workspaceId: string
  topic: string
  platform: SocialPlatform
  tone: ContentTone
  targetAudience: string
  plannerSlot?: ContentCalendarSlot
}

export interface CreatorOutput {
  caption: string
  hashtags: string[]
  videoScript?: string
  visualRecommendations: string[]
  alternativeVersions: string[]
}

// ─── Agent Run ────────────────────────────────────────────────────────────────

export interface AgentRun {
  id: string
  workspaceId: string
  agentType: AgentType
  inputSnapshot: string
  outputSnapshot: string
  modelUsed: string
  durationMs: number
  status: 'running' | 'completed' | 'failed'
  errorMessage?: string
  createdAt: string
}

// ─── Ollama ───────────────────────────────────────────────────────────────────

export interface OllamaHealth {
  isRunning: boolean
  version?: string
  availableModels: string[]
}

export interface OllamaModel {
  name: string
  size: number
  modifiedAt: string
}

export interface OllamaConfig {
  baseUrl: string
  defaultModel: string
  timeoutMs: number
  maxTokens: number
  temperature: number
}
