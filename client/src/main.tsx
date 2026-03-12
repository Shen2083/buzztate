import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const root = document.getElementById("root")!;

// If the root contains prerendered content (more than just the loading spinner),
// hydrate to preserve the existing DOM and attach event handlers.
const hasPrerendered = root.querySelector("[data-prerendered]") !== null;
if (hasPrerendered) {
  hydrateRoot(root, <App />);
} else {
  createRoot(root).render(<App />);
}
