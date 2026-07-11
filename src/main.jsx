import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// Base44 sends password-reset links as /reset-password?token=... while this
// static application uses HashRouter. Move the token into the hash route before
// React starts so ResetPassword can receive it without creating another backend.
if (window.location.pathname.endsWith('/reset-password')) {
  const appBasePath = window.location.pathname.replace(/\/reset-password$/, '/')
  window.location.replace(`${appBasePath}#/reset-password${window.location.search}`)
} else {
ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
}
