import path from "path";
import express from "express";
import { LspClient } from "./client/lsp/lsp-client";
import { createRouter } from "./route";
import { WorkspaceManager } from "./client/workspace-manager";
import { InspectionService } from "./service";

const app = express();

const prjPath = path.resolve(path.join(__dirname, "../../.."));

const client = new LspClient({
  // command: "rls",
  // command: "../../node_modules/.bin/typescript-language-server",
  // args: ["--stdio", "--tsserver-path", path.join(prjPath, "node_modules/.bin/tsserver"), "--tsserver-log-file", path.join(prjPath, "tss.log"), "--log-level", "3"],
  command: "../../node_modules/.bin/javascript-typescript-stdio",
});


const wsManager = new WorkspaceManager({
  projectRoot: prjPath,
});

const service = new InspectionService({
  lspClient: client,
  workspaceManager: wsManager,
});

app.use((req, res, next) => {
  console.log("[request]", req.method, req.path, JSON.stringify(req.headers));
  next();
});

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.use("/api/v1", createRouter({ service }));

async function main() {
  await client.initialize({
    processId: process.pid,
    capabilities: { },
    rootUri: `file://${prjPath}`,
    rootPath: prjPath,
    workspaceFolders: null,
  }).wait();

  app.listen(3000, () => {
    console.log("start");
  });
}

main();
