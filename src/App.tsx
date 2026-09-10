import { useState } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export default function App() { 
  const [history, setHistory] = useState<Message[]>([])
  const [input, setInput] = useState('')
  
  const sendMessage = async () => {
    if (input.trim() === '') return
    
    setHistory([...history, {
      id: crypto.randomUUID(),
      role: 'user',
      content: input
    }])
    setInput('')
  }

  return (
    <div>
      <h1>Chatbot</h1>
       <input 
        type="text" 
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Schreib eine Nachricht..."
      />
      <button onClick={sendMessage}>Absenden</button>

      <div>
        {history.map((msg) => (
          <div key={msg.id}>
            <strong>{msg.role}:</strong>
            {msg.content}
          </div>
        ))}
      </div>
    </div>
  )

}