import {
  DocumentPosition,
} from "./types";

chrome.runtime.onMessage.addListener((req: { type: string, params: any }, sender, sendResponse) => {
  console.log(req);
  const { type, params } = req;
  switch (type) {
    case "getHover":
      getHover(params).then(r => sendResponse(r));
      return true;
    case "getDefinition":
      getDefinition(params).then(r => sendResponse(r));
      return true;
    default:
      console.error("no matched type");
  }
});

async function getHover(params: { endpoint: string, filePath: string, position: DocumentPosition }) {
  const { endpoint, filePath, position } = params;
  const res = await fetch(`${endpoint}/api/v1/hover/${filePath}?line=${position.line}&character=${position.character}`);
  return res.json();
}

async function getDefinition(params: { endpoint: string, filePath: string, position: DocumentPosition }) {
  const { endpoint, filePath, position } = params;
  const res = await fetch(`${endpoint}/api/v1/definition/${filePath}?line=${position.line}&character=${position.character}`);
  return res.json();
}

