import fs from "fs";
import { LspClient } from "../client/lsp/lsp-client";
import { WorkspaceManager } from "../client/workspace-manager";

export class InspectionError extends Error {
}

export class InspectionService {

  readonly lspClient: LspClient;
  readonly workspaceManager: WorkspaceManager;

  constructor({ lspClient, workspaceManager }: { lspClient: LspClient, workspaceManager: WorkspaceManager }) {
    this.lspClient = lspClient;
    this.workspaceManager = workspaceManager;
  }

  async getDefinition({ filePath, line, character }: { filePath: string, line: number, character: number }) {
    const uri = await this.workspaceManager.open(filePath, (d, text) => this.lspClient.textDocumentDidOpen({
      textDocument: {
        uri: d,
        text,
        languageId: "typescript",
        version: 1,
      }
    }).wait());
    try {
      return await this.lspClient.textDocumentDefinition({
        textDocument: { uri },
        position: { line, character },
      }).wait();
    } catch (err) {
      console.log(err.message);
      throw new InspectionError(err.message);
    }
  }
}
