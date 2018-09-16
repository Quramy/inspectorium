
export function findPositionFromSelected(node: HTMLElement, target: string): { line: number, character: number } | null {
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

export function findPositionFromCursor({ x, y, offsetX }: { x: number, y: number, offsetX: number }) {
  const n = document.elementFromPoint(x, y);
  if (!n) return null;
  let target: Node | HTMLSpanElement | undefined;
  let text: string | null = null;
  if (n.classList.contains("js-file-line")) {
    const td = n as HTMLTableColElement;
    let afterSpan: HTMLSpanElement | undefined;
    for (let n of td.childNodes) {
      if (n.nodeName === "SPAN") {
        if ((n as HTMLSpanElement).offsetLeft > offsetX) {
          afterSpan = n as HTMLSpanElement;
          break;
        }
      }
    }
    if (!afterSpan) return null;
    const textNode = afterSpan.previousSibling;
    if (!textNode) return null;
    target = textNode;
    text = textNode.nodeValue;
  } else if(n.nodeName === "SPAN" && n.parentElement && n.parentElement.classList.contains("js-file-line")) {
    target = n;
    text = n.textContent;
  }
  if (!target || !text) return null;
  const pos = findPositionFromSelected(target as HTMLElement, text);
  return pos;
}

export function getRepositoryInfoFromLocation() {
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

export function tryMount(cb: (mp: Element) => any) {
  const b = document.querySelector("body");
  if (b) {
    const mountPoint = document.createElement("div");
    mountPoint.setAttribute("id", "hover_view");
    b.appendChild(mountPoint);
    cb(mountPoint);
  }
}

export function tryMountRepositoryConfigView(cb: (mp: Element) => any) {
  const domId = "inspectorium_repository_config";
  if (document.getElementById(domId)) return;
  const mountPoint = document.createElement("div");
  mountPoint.setAttribute("id", domId);
  const ref = document.querySelector(".application-main");
  if (!ref || !ref.nextElementSibling) return;
  ref.parentNode!.insertBefore(mountPoint, ref.nextElementSibling);
  cb(mountPoint);
}

