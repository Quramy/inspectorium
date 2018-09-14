import { LspClient } from "../client/lsp/lsp-client";
import { WorkspaceManager } from "../client/workspace-manager";
import { path2languageId } from "./util";
import { ServerCapabilities } from "vscode-languageserver-protocol/lib/protocol";

export class NotSupportedCapabilityError extends Error {
}

export class InspectionError extends Error {
}

type Diff<T, U> = T extends U ? never : T;
type $Diff<T, U> = Pick<T, Diff<keyof T, keyof U>>;

export class InspectionService {

  readonly capabilities: ServerCapabilities;
  readonly lspClient: LspClient;
  readonly workspaceManager: WorkspaceManager;

  constructor({ lspClient, workspaceManager, capabilities }: { lspClient: LspClient, workspaceManager: WorkspaceManager, capabilities: ServerCapabilities }) {
    this.lspClient = lspClient;
    this.workspaceManager = workspaceManager;
    this.capabilities = capabilities;
  }

  async getHover({ filePath, line, character }: { filePath: string, line: number, character: number }) {
    if (!this.capabilities.hoverProvider) {
      throw new NotSupportedCapabilityError("server does not support hoverProvider.");
    }
    const { uri } = await this.openDocumentIfNeeded(filePath);
    try {
      const result = await this.lspClient.textDocumentHover({
        textDocument: { uri },
        position: { line, character },
      }).wait();
      if (!result) return { contents: [] };
      if (!Array.isArray(result.contents)) return { contents: [result.contents] };
      return { contents: result.contents || [] };
    } catch (err) {
      throw new InspectionError(err.message);
    }
  }

  async getReferences({ filePath, line, character }: { filePath: string, line: number, character: number }) {
    if (!this.capabilities.referencesProvider) {
      throw new NotSupportedCapabilityError("server does not support referencesProvider");
    }
    const { uri } = await this.openDocumentIfNeeded(filePath);
    try {
      const result = await this.lspClient.textDocumentReferences({
        context: {
          includeDeclaration: false,
        },
        textDocument: { uri },
        position: { line, character },
      }).wait();
      return result.map(r => this.convertUri(r));
    } catch (err) {
      throw new InspectionError(err.message);
    }
  }

  async getDefinition({ filePath, line, character }: { filePath: string, line: number, character: number }) {
    if (!this.capabilities.definitionProvider) {
      throw new NotSupportedCapabilityError("server does not support definitionProvider.");
    }
    const { uri } = await this.openDocumentIfNeeded(filePath);
    try {
      const result = await this.lspClient.textDocumentDefinition({
        textDocument: { uri },
        position: { line, character },
      }).wait();
      if (!result) return [];
      if (Array.isArray(result)) {
        return result.map(r => this.convertUri(r));
      } else {
        return [this.convertUri(result)];
      }
    } catch (err) {
      throw new InspectionError(err.message);
    }
  }

  private async openDocumentIfNeeded(filePath: string) {
    const languageId = path2languageId(filePath);
    const uri = await this.workspaceManager.open(filePath, (d, text) => this.lspClient.textDocumentDidOpen({
      textDocument: {
        uri: d,
        text,
        languageId,
        version: 1,
      }
    }).wait());
    return { uri };
  }

  private convertUri<T extends { uri: string }>(obj: T): $Diff<T, { uri: string }> & { path: string } {
    const { uri, ...rest } = obj as object & { uri: string };
    return {
      path: this.workspaceManager.uri2FilePath(uri),
      ...rest,
    } as any;
  }
}
