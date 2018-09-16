import {
  DocumentPosition,
  GetHoverResponse,
} from "@inspectorium/schema";

export type AppState = {
  owner: string,
  repository: string,
  currentFile: string,
  ref: string,
  endpoint: string,
  scrollTop: number,
  hoverPosition: DocumentPosition | null,
  hoverContents: GetHoverResponse["contents"] | null,
  hoverPoint: { x: number, y: number } | null,
};
