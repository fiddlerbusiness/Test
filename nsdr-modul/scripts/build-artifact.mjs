// Baut eine eigenständige HTML-Seite (Fragment ohne <html>/<head>/<body>) für ein claude.ai-Artifact:
// vorgerendertes Markup + kompiliertes Tailwind-CSS inline, React 18.3.1 als UMD von cdnjs.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import * as esbuild from "esbuild";
import postcss from "postcss";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// Optionales Zielverzeichnis als erstes Argument; Standard: build/
const outDir = path.resolve(root, process.argv[2] ?? "build");
// Das SSR-Bundle bleibt im Projekt, damit `react` aus node_modules auflösbar ist.
const tmpDir = path.join(root, "build");
const r = (p) => path.join(root, p);

const REACT_VERSION = "18.3.1";
const TITLE = "NSDR Gehirn-Reboot";
const DESCRIPTION = "Interaktives, evidenzgeprüftes Modul zu Non-Sleep Deep Rest: Mechanismen, Effekte, Session-Ablauf und Einsatz-Protokoll.";
const FONTS =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..700&family=JetBrains+Mono:wght@400;500&family=Source+Serif+4:ital,opsz,wght@0,8..60,400..600;1,8..60,400&display=swap";

await mkdir(outDir, { recursive: true });
await mkdir(tmpDir, { recursive: true });

// 1) CSS
const rawCss = await readFile(r("src/styles.css"), "utf8");
const tw = await postcss([tailwindcss({ config: r("tailwind.config.js") }), autoprefixer]).process(rawCss, { from: r("src/styles.css") });
const { code: css } = await esbuild.transform(tw.css, { loader: "css", minify: true });

// 2) Vorrendern auf dem Server
const ssrFile = path.join(tmpDir, "ssr-bundle.mjs");
await esbuild.build({
  entryPoints: [r("src/NSDRModule.jsx")],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: ssrFile,
  external: ["react", "react-dom"],
  jsx: "transform",
  logLevel: "warning",
});
const { default: NSDRModule } = await import(`${pathToFileURL(ssrFile).href}?t=${Date.now()}`);
const React = (await import("react")).default;
const { renderToString } = await import("react-dom/server");
const markup = renderToString(React.createElement(NSDRModule));

// 3) Client-Bundle ohne React (kommt als UMD von cdnjs)
const client = await esbuild.build({
  entryPoints: [r("src/entry-artifact.jsx")],
  bundle: true,
  format: "iife",
  minify: true,
  target: "es2019",
  write: false,
  jsx: "transform",
  alias: {
    react: r("scripts/shims/react.cjs"),
    "react-dom/client": r("scripts/shims/react-dom-client.cjs"),
  },
  logLevel: "warning",
});
const js = client.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");

const html = `<title>${TITLE}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="${DESCRIPTION}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<style>${css}</style>
<div id="root">${markup}</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/${REACT_VERSION}/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/${REACT_VERSION}/umd/react-dom.production.min.js"></script>
<script>${js}</script>
`;

const outFile = path.join(outDir, "nsdr-modul.html");
await writeFile(outFile, html);
console.log(`${outFile}  (${(Buffer.byteLength(html) / 1024).toFixed(1)} KB)`);
