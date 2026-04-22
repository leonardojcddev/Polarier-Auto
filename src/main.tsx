import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { App as CapacitorApp } from '@capacitor/app';

CapacitorApp.addListener('appUrlOpen', (event) => {
  const url = event.url;
  if (url.includes('verify-email')) {
    window.location.href = '/verify-email';
  }
});

createRoot(document.getElementById("root")!).render(<App />);
