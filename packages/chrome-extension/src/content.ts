import {
  DocumentRange,
} from "./types";

function findPosision(node: HTMLElement, target: string): { line: number, character: number } | null {
  while (true) {
    if (!node.getAttribute) {
      node = node.parentNode as HTMLElement;
      continue;
    }
    const id = node.getAttribute("id");
    if (id) {
      const hit = id.match(/^LC(\d+)$/);
      if (hit) {
        const line = +hit[1] - 1;
        const character = node.textContent ? node.textContent.indexOf(target) : 0;
        return { line, character };
      }
    }
    if (node.nodeName === "BODY" || !node.parentNode) {
      return null;
    }
    node = node.parentNode as HTMLElement;
  }
}

function getPath() {
  const paths = location.pathname.split("/");
  if (paths.length > 3 && paths[3] === "blob") {
    const [$, owner, repository, _, ref, ...filePathSegments] = paths;
    return {
      owner,
      repository,
      ref,
      filePath: filePathSegments.join("/"),
    };
  }
}

window.addEventListener("keyup", e => {
  if (e.ctrlKey && e.keyCode === 221) {
    const selection = document.getSelection();
    const focusNode = selection.focusNode as HTMLElement;
    const pos = findPosision(focusNode, selection.toString());
    if (!pos) return;
    const pathInfo = getPath();
    if (!pathInfo) return;
    console.log(pos, pathInfo);
    // TODO custom endpoint
    chrome.runtime.sendMessage({ type: "getDefinition", params: { ...pathInfo, endpoint: "http://localhost:4000", position: pos } }, (res: { path: string, range: DocumentRange }[]) => {
      console.log(res);
      if (!res.length) {
        // TODO handle empty result
        return;
      }
      const { path, range } = res[0];
      if (path === pathInfo.filePath) {
        location.hash = `L${range.start.line + 1}`;
      } else {
        location.href= `/${pathInfo.owner}/${pathInfo.repository}/blob/${pathInfo.ref}/${path}#L${range.start.line + 1}`
      }
    });
  }
});
