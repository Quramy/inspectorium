
export type DocumentPosition = {
  line: number,
  character: number,
};

export type DocumentRange = {
  start: DocumentPosition,
  end: DocumentPosition,
};

export type MarkupContent = {
  kind: string,
  value: string,
};
