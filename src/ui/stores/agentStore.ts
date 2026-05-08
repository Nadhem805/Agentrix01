import { create } from 'zustand'
import type {
  AgentType,
  AgentStatus,
  AgentRun,
  AnalyzerOutput,
  PlannerOutput,
  CreatorOutput,
  OllamaHealth,
} from '@/types/agent'

interface AgentStore {
  // Ollama status
  ollamaHealth: OllamaHealth | null
  isCheckingOllama: boolean

  // Active run state
  activeAgentType: AgentType | null
  agentStatus: AgentStatus
  streamingText: string
  progress: number

  // Outputs
  analyzerOutput: AnalyzerOutput | null
  plannerOutput: PlannerOutput | null
  creatorOutput: CreatorOutput | null

  // History
  agentRuns: AgentRun[]

  // Actions
  checkOllama: () => Promise<void>
  runAnalyzer: (workspaceId: string) => Promise<void>
  runPlanner: (workspaceId: string) => Promise<void>
  runCreator: (workspaceId: string, topic: string) => Promise<void>
  appendStreamChunk: (chunk: string) => void
  resetAgent: () => void
  fetchAgentRuns: (workspaceId: string) => Promise<void>
}

export const useAgentStore = create<AgentStore>((set) => ({
  ollamaHealth: null,
  isCheckingOllama: false,
  activeAgentType: null,
  agentStatus: 'idle',
  streamingText: '',
  progress: 0,
  analyzerOutput: null,
  plannerOutput: null,
  creatorOutput: null,
  agentRuns: [],

  checkOllama: async () => {
    set({ isCheckingOllama: true })
    try {
      // TODO: ipc.invoke('ollama:health') in Phase 3
      set({ ollamaHealth: { isRunning: false, availableModels: [] } })
    } finally {
      set({ isCheckingOllama: false })
    }
  },

  runAnalyzer: async (_workspaceId: string) => {
    set({ activeAgentType: 'analyzer', agentStatus: 'running', streamingText: '', progress: 0 })
    try {
      // TODO: ipc.invoke('agent:run', {type: 'analyzer', ...}) in Phase 3
      // Stream chunks via ipc.on('agent:stream', chunk => appendStreamChunk(chunk))
    } catch (err) {
      set({ agentStatus: 'failed' })
    }
  },

  runPlanner: async (_workspaceId: string) => {
    set({ activeAgentType: 'planner', agentStatus: 'running', streamingText: '', progress: 0 })
    try {
      // TODO: ipc.invoke('agent:run', {type: 'planner', ...}) in Phase 3
    } catch (err) {
      set({ agentStatus: 'failed' })
    }
  },

  runCreator: async (_workspaceId: string, _topic: string) => {
    set({ activeAgentType: 'creator', agentStatus: 'running', streamingText: '', progress: 0 })
    try {
      // TODO: ipc.invoke('agent:run', {type: 'creator', ...}) in Phase 3
    } catch (err) {
      set({ agentStatus: 'failed' })
    }
  },

  appendStreamChunk: (chunk) => {
    set((state) => ({ streamingText: state.streamingText + chunk }))
  },

  resetAgent: () => {
    set({ activeAgentType: null, agentStatus: 'idle', streamingText: '', progress: 0 })
  },

  fetchAgentRuns: async (_workspaceId: string) => {
    // TODO: ipc.invoke('agent:runs', {workspaceId}) in Phase 3
  },
}))
