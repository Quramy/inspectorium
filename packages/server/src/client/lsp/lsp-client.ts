import fs from "fs";
import cp from "child_process";
import path from "path";
import { EventEmitter } from "events";
import {
  InitializeParams,
  InitializeResult,
  DidOpenTextDocumentParams,
  TextDocumentPositionParams,
  Definition,
} from "vscode-languageserver-protocol";
import { JsonRpc, JsonRpcStream } from "./json-rpc";

export class LspClient extends EventEmitter {
  private reqId = 0;
  private languageServer: cp.ChildProcess;
  private jsonRpc: JsonRpc;

  constructor ({ command, args }: { command: string, args?: string[] }) {
    super();
    this.jsonRpc = new JsonRpc();
    this.languageServer = cp.spawn(command, args);
    this.languageServer.stdout.pipe(new JsonRpcStream()).on("data", (buffer: Buffer) => {
      console.log("buffer:", buffer.toString());
      this.emit("data", JSON.parse(buffer.toString().trim()));
    });
  }

  waitForReust<T = { }>(id: number) {
    return new Promise<T>((resolve, reject) => {
      const listener = (d: { id?: number, result?: T, error?: any }) => {
        if (d.id === id) {
          if (d.error) {
            reject(d.error);
          } else if (d.result) {
            resolve(d.result);
          } else {
            reject({ message: "no result or error in payload" });
          }
          this.removeListener("data", listener);
        }
      };
      this.on("data", listener);
    });
  }
  
  initialize(params: InitializeParams) {
    return this.send<InitializeResult>({ method: "initialize", params });
  }

  textDocumentDidOpen(params: DidOpenTextDocumentParams) {
    return this.sendOneWay({ method: "textDocument/didOpen", params });
  }

  textDocumentDefinition(params: TextDocumentPositionParams) {
    return this.send<Definition>({ method: "textDocument/definition", params});
  }

  private send<R>(msg: object) {
    const id = ++this.reqId;
    this.languageServer.stdin.write(this.jsonRpc.encode({ id, ...msg }));
    return { id, wait: () => this.waitForReust<R>(id) };
  }

  private sendOneWay(msg: object) {
    const id = ++this.reqId;
    this.languageServer.stdin.write(this.jsonRpc.encode({ ...msg }));
    return { id, wait: () => Promise.resolve() };
  }
}
