import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const showFatalClientError = (message: string) => {
  const root = document.getElementById('root');
  if (!root) return;
  root.innerHTML = `
    <div style="min-height:100vh;background:#111827;color:white;display:flex;align-items:center;justify-content:center;padding:24px;font-family:sans-serif;direction:rtl">
      <div style="max-width:680px;background:#1f2937;border:1px solid rgba(248,113,113,.5);border-radius:16px;padding:24px;text-align:center">
        <h1 style="font-size:24px;font-weight:700;color:#fca5a5;margin:0 0 12px">خطا در اجرای صفحه</h1>
        <p style="color:#d1d5db;margin:0 0 12px">صفحه به جای خالی شدن، خطای واقعی را نشان می‌دهد. یک بار Ctrl+F5 بزنید و اگر تکرار شد همین متن را بفرستید.</p>
        <pre style="white-space:pre-wrap;word-break:break-word;color:#9ca3af;font-size:12px;text-align:left;direction:ltr">${message}</pre>
      </div>
    </div>`;
};

window.addEventListener('error', (event) => {
  showFatalClientError(event.message || 'Unknown client error');
});

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  showFatalClientError(reason instanceof Error ? reason.message : String(reason || 'Unhandled promise rejection'));
});


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
