import path from "path";
import express from "express";
import { LspClient } from "./client/lsp/lsp-client";
import { createRouter } from "./route";
import { WorkspaceManager } from "./client/workspace-manager";
import { InspectionService } from "./service";

export type BootstrapOptions = {
  port: number,
  projectRoot: string,
  languageServer: {
    command: string,
    args: string[],
  },
};

export async function bootstrap(options: BootstrapOptions) {
  const app = express();
  
  const prjPath = path.resolve(options.projectRoot);
  const client = new LspClient(options.languageServer);
  
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

  await client.initialize({
    processId: process.pid,
    capabilities: { },
    rootUri: `file://${prjPath}`,
    rootPath: prjPath,
    workspaceFolders: null,
  }).wait();

  app.listen(options.port, () => {
    console.log(`Server successfully started listening on ${options.port} .`);
  });
}
