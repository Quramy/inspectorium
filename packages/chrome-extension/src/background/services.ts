import {
  DocumentPosition,
  GetHoverResponse,
  GetDefinitionResponse,
} from "@inspectorium/schema";

export const services = {

  getDefinition: async (params: { endpoint: string, ref: string, filePath: string, position: DocumentPosition }) => {
    const { endpoint, filePath, position } = params;
    const res = await fetch(`${endpoint}/api/v1/definition/${filePath}?line=${position.line}&character=${position.character}`);
    return await res.json() as GetDefinitionResponse;
  },

  getHover: async (params: { endpoint: string, ref: string, filePath: string, position: DocumentPosition }): Promise<GetHoverResponse> => {
    const { endpoint, filePath, position } = params;
    const res = await fetch(`${endpoint}/api/v1/hover/${filePath}?line=${position.line}&character=${position.character}`);
    return await res.json();
  },

};

