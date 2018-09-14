
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
