import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

// Register the service worker for offline support
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log("[PWA] New content available — reload to update");
  },
  onOfflineReady() {
    console.log("[PWA] App is ready to work offline");
  },
});

createRoot(document.getElementById("root")!).render(<App />);
