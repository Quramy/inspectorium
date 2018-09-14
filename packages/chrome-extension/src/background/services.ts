import {
  DocumentPosition,
} from "../types";

export const services = {

  getHover: async (params: { endpoint: string, ref: string, filePath: string, position: DocumentPosition }) => {
    const { endpoint, filePath, position } = params;
    const res = await fetch(`${endpoint}/api/v1/hover/${filePath}?line=${position.line}&character=${position.character}`);
    return res.json();
  },

  getDefinition: async (params: { endpoint: string, ref: string, filePath: string, position: DocumentPosition }) => {
    const { endpoint, filePath, position } = params;
    const res = await fetch(`${endpoint}/api/v1/definition/${filePath}?line=${position.line}&character=${position.character}`);
    return res.json();
  },

};

