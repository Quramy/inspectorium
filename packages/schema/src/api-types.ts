import {
  DocumentRange,
  MarkupContent,
} from "./common-types";

export type GetHoverResponse = {
  contents: (string | MarkupContent | {
    language: string,
    value: string,
  })[],
};

export type GetReferencesResponse = {
  path: string,
  range: DocumentRange,
}[];

export type GetDefinitionResponse = {
  path: string,
  range: DocumentRange,
}[];
