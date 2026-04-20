"use strict";

const path = require("path");
const fs = require("fs");
const { build, SOURCES } = require("./build-components");

const ROOT = path.resolve(__dirname, "..");
let timer = null;
let running = false;
let queued = false;

function runBuild() {
  if (running) {
    queued = true;
    return;
  }

  running = true;
  try {
    build();
    process.stdout.write(`[watch] Built components.js at ${new Date().toLocaleTimeString()}\n`);
  } catch (err) {
    process.stderr.write(`[watch] Build failed: ${err.message}\n`);
  } finally {
    running = false;
    if (queued) {
      queued = false;
      runBuild();
    }
  }
}

function scheduleBuild() {
  if (timer) clearTimeout(timer);
  timer = setTimeout(runBuild, 120);
}

runBuild();

SOURCES.forEach(relPath => {
  const absPath = path.join(ROOT, relPath);
  fs.watch(absPath, { persistent: true }, () => scheduleBuild());
});

process.stdout.write("[watch] Watching JSX source files...\n");

