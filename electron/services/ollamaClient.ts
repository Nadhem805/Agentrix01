// Ollama HTTP client — communicates with local Ollama server at localhost:11434

export const OLLAMA_BASE_URL = 'http://localhost:11434'
export const DEFAULT_MODEL = 'llama3.2'

export async function checkOllamaHealth(): Promise<{ isRunning: boolean; models: string[] }> {
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`)
    if (!res.ok) return { isRunning: false, models: [] }
    const data = await res.json() as { models: Array<{ name: string }> }
    return { isRunning: true, models: data.models.map((m) => m.name) }
  } catch {
    return { isRunning: false, models: [] }
  }
}

export async function* generateStream(
  model: string,
  prompt: string,
  options?: { temperature?: number; num_predict?: number }
): AsyncGenerator<string> {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, stream: true, options }),
  })

  if (!res.ok || !res.body) throw new Error(`Ollama error: ${res.status}`)

  const reader = res.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const lines = decoder.decode(value).split('\n').filter(Boolean)
    for (const line of lines) {
      try {
        const json = JSON.parse(line) as { response: string; done: boolean }
        if (json.response) yield json.response
        if (json.done) return
      } catch {
        // skip malformed lines
      }
    }
  }
}
