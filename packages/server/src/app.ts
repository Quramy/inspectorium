import path from "path";
import express from "express";
import { LspClient } from "./client/lsp/lsp-client";
import { createRouter } from "./route";
import { WorkspaceManager } from "./client/workspace-manager";
import { InspectionService } from "./service";

export type BootstrapOptions = {
  port: number,
  projectRoot: string,
  pathPrefix: string,
  codeVersion: string,
  languageServer: {
    command: string,
    args: string[],
  },
};

export async function bootstrap(options: BootstrapOptions) {

  console.log(JSON.stringify(options));
  
  const app = express();
  const prjPath = path.resolve(options.projectRoot);
  const client = new LspClient(options.languageServer);

  const initializeResult = await client.initialize({
    processId: process.pid,
    capabilities: { },
    rootUri: `file://${prjPath}`,
    rootPath: prjPath,
    workspaceFolders: null,
  }).wait();

  
  const wsManager = new WorkspaceManager({
    projectRoot: prjPath,
  });
  
  const service = new InspectionService({
    lspClient: client,
    workspaceManager: wsManager,
    capabilities: initializeResult.capabilities,
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
  
  app.use(options.pathPrefix ? `/${options.pathPrefix}/api/v1` : "/api/v1", createRouter({ service }));

  app.get("/", (req, res) => res.status(200).end());

  app.listen(options.port, () => {
    console.log(`Server successfully started listening on ${options.port} .`);
  });
}
