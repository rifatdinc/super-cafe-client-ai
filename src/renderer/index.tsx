import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'

// Create root inside try-catch to handle any initialization errors
try {
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
  )
} catch (error) {
  // Handle initialization errors (e.g., missing environment variables)
  console.error('Failed to initialize application:', error)
  
  // Show error to user
  const rootElement = document.getElementById('root')
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="
        display: flex;
        height: 100vh;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        font-family: system-ui, -apple-system, sans-serif;
        text-align: center;
        padding: 20px;
      ">
        <h1 style="color: #ef4444; margin-bottom: 16px;">Application Error</h1>
        <p style="color: #6b7280; max-width: 500px;">
          There was an error initializing the application. This might be due to missing configuration.
          Please check the application logs and ensure all required environment variables are set.
        </p>
        ${process.env.NODE_ENV === 'development' 
          ? `<pre style="
              margin-top: 20px;
              padding: 16px;
              background: #f3f4f6;
              border-radius: 8px;
              overflow-x: auto;
              max-width: 90vw;
            ">${error instanceof Error ? error.message : 'Unknown error'}</pre>`
          : ''
        }
      </div>
    `
  }
}
