/**
 * Post-build prerendering script.
 *
 * 1. Uses Vite's SSR build to compile the entry-prerender.tsx module
 * 2. Imports it and calls render() for each route
 * 3. Injects the rendered HTML into the Vite-built index.html shell
 * 4. Writes the result as static HTML files in dist/public/
 *
 * Run after the normal Vite client build: `tsx script/prerender.ts`
 */
import { build as viteBuild } from "vite";
import react from "@vitejs/plugin-react";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.resolve(ROOT, "dist/public");
const BASE_URL = "https://buzztate.com";

async function prerender() {
  console.log("prerendering: building SSR bundle...");

  // Build SSR bundle using Vite (must replicate path aliases from vite.config)
  const clientRoot = path.resolve(ROOT, "client");
  await viteBuild({
    root: clientRoot,
    resolve: {
      alias: {
        "@": path.resolve(clientRoot, "src"),
        "@shared": path.resolve(ROOT, "shared"),
        "@assets": path.resolve(ROOT, "attached_assets"),
      },
    },
    plugins: [react()],
    build: {
      ssr: "src/entry-prerender.tsx",
      outDir: path.resolve(ROOT, "dist/ssr"),
      emptyOutDir: true,
    },
    logLevel: "warn",
  });

  // Import the SSR module
  const ssrModule = await import(
    path.resolve(ROOT, "dist/ssr/entry-prerender.js")
  );
  const { render, routes, PAGE_SEO } = ssrModule;

  // Read the Vite-built index.html shell
  const shellHtml = await readFile(path.resolve(DIST, "index.html"), "utf-8");

  // Replace inner content of <div id="root">...</div> with prerendered HTML.
  // The shell contains a loading spinner + keyframe style inside the root div.
  const ROOT_OPEN = '<div id="root">';
  const rootStart = shellHtml.indexOf(ROOT_OPEN);
  if (rootStart === -1) throw new Error("Could not find root div in index.html");

  // Find the matching closing </div> — it's followed by </body>
  const afterOpen = rootStart + ROOT_OPEN.length;
  const bodyClose = shellHtml.indexOf("</body>", afterOpen);
  // The </div> immediately before </body> closes the root
  const rootClose = shellHtml.lastIndexOf("</div>", bodyClose);

  const beforeRoot = shellHtml.slice(0, afterOpen);
  const afterRoot = shellHtml.slice(rootClose);

  for (const route of routes) {
    console.log(`  prerendering ${route}...`);
    const html = render(route);

    // Inject per-page title and meta descriptions into the shell
    let fullHtml = beforeRoot + html + afterRoot;
    const seo = PAGE_SEO?.[route];
    const canonicalUrl = route === "/" ? `${BASE_URL}/` : `${BASE_URL}${route}`;

    if (seo) {
      fullHtml = fullHtml.replace(
        /<title>[^<]*<\/title>/,
        `<title>${seo.title}</title>`,
      );
      fullHtml = fullHtml.replace(
        /name="description" content="[^"]*"/,
        `name="description" content="${seo.description}"`,
      );
      fullHtml = fullHtml.replace(
        /property="og:description" content="[^"]*"/,
        `property="og:description" content="${seo.description}"`,
      );
      fullHtml = fullHtml.replace(
        /name="twitter:description" content="[^"]*"/,
        `name="twitter:description" content="${seo.description}"`,
      );
      // Inject og:title and twitter:title
      fullHtml = fullHtml.replace(
        /property="og:title" content="[^"]*"/,
        `property="og:title" content="${seo.title}"`,
      );
      fullHtml = fullHtml.replace(
        /name="twitter:title" content="[^"]*"/,
        `name="twitter:title" content="${seo.title}"`,
      );
    }

    // Inject canonical URL
    const canonicalTag = `<link rel="canonical" href="${canonicalUrl}">`;
    fullHtml = fullHtml.replace(
      "</head>",
      `    ${canonicalTag}\n  </head>`,
    );

    // Inject og:url and twitter:url
    fullHtml = fullHtml.replace(
      /property="og:url" content="[^"]*"/,
      `property="og:url" content="${canonicalUrl}"`,
    );
    fullHtml = fullHtml.replace(
      /name="twitter:url" content="[^"]*"/,
      `name="twitter:url" content="${canonicalUrl}"`,
    );

    // Determine output path
    if (route === "/") {
      // Overwrite index.html for the homepage
      await writeFile(path.resolve(DIST, "index.html"), fullHtml);
    } else {
      // Create /route-name/index.html for sub-pages
      const dir = path.resolve(DIST, route.slice(1));
      await mkdir(dir, { recursive: true });
      await writeFile(path.resolve(dir, "index.html"), fullHtml);
    }
  }

  console.log(`prerendering: done (${routes.length} pages)`);
}

prerender().catch((err) => {
  console.error("prerender failed:", err);
  process.exit(1);
});
