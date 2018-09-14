import { DocumentPosition } from "@inspectorium/schema";

export type AppState = {
  owner: string,
  repository: string,
  currentFile: string,
  ref: string,
  endpoint: string,
  hoverPosition: DocumentPosition | null,
};
