import { useState, useEffect } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

async function callChatAPI(message: string, signal?: AbortSignal): Promise<string> {
  const delay = Math.random() * 5000 + 500

  await new Promise((resolve, reject) => {
    const timeoutId = setTimeout(resolve, delay)
    
    signal?.addEventListener('abort', () => {
      clearTimeout(timeoutId)
      reject(new Error('AbortError: Request was cancelled'))
    })
  })
  
  if (Math.random() < 0.1) {
    throw new Error('API momentarily unavailable')
  }

  return `Du hast gesagt: "${message}". Das ist interessant!`
}

export default function App() {
  const [history, setHistory] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  let abortController: AbortController | null = null

  // ← Dieser useEffect ersetzt den Vue watch für Error-Auto-Clear
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null)
      }, 5000)
      
      return () => clearTimeout(timer)  // Cleanup
    }
  }, [error])  // ← Nur wenn error sich ändert

  const sendMessage = async () => {
    if (input.trim() === '') return

    // Alte Request abbrechen
    if (abortController) {
      abortController.abort()
    }
    abortController = new AbortController()

    setHistory([...history, {
      id: crypto.randomUUID(),
      role: 'user',
      content: input
    }])

    const userMessage = input
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      const response = await callChatAPI(userMessage, abortController.signal)
      
      setHistory(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response
      }])
    } catch (err) {
      if (err instanceof Error && err.message.includes('AbortError')) {
        console.log('Request was cancelled')
        return
      }
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <h1>Chatbot</h1>
      <input 
        type="text" 
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isLoading}
        placeholder="Schreib eine Nachricht..."
      />
      <button onClick={sendMessage} disabled={isLoading}>
        {isLoading ? 'Senden' : 'Absenden'}
      </button>

      {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}

      <div>
        {history.map((msg) => (
          <div key={msg.id}>
            <strong>{msg.role}:</strong>
            {msg.content}
          </div>
        ))}
      </div>

      {isLoading && <div style={{ color: 'gray' }}><em>Assistant schreibt...</em></div>}
    </div>
  )
}