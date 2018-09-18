import {
  DocumentPosition,
  GetHoverResponse,
  GetDefinitionResponse,
} from "@inspectorium/schema";

function addReference(endpoint: string, ref: string) {
  return endpoint + "/" + ref;
}

export const services = {

  getDefinition: async (params: { endpoint: string, ref: string, filePath: string, position: DocumentPosition }) => {
    const { endpoint, ref, filePath, position } = params;
    const res = await fetch(`${addReference(endpoint, ref)}/api/v1/definition/${filePath}?line=${position.line}&character=${position.character}`);
    return await res.json() as GetDefinitionResponse;
  },

  getHover: async (params: { endpoint: string, ref: string, filePath: string, position: DocumentPosition }): Promise<GetHoverResponse> => {
    const { endpoint, ref, filePath, position } = params;
    const res = await fetch(`${addReference(endpoint, ref)}/api/v1/hover/${filePath}?line=${position.line}&character=${position.character}`);
    return await res.json() as GetHoverResponse;
  },

};

