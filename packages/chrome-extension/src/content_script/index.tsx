import * as React from "react";
import { render } from "react-dom";

import { DocumentRange } from "../types";
import { UrlChangeObserver } from "./lib/url-change";
import RepositoryConfig from "./components/repository-config";

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

function addRepositoryConfigView() {
  const pathInfo = getPath();
  if (!pathInfo) return;
  const b = document.querySelector("body");
  if (!b) {
    throw new Error("no <body> element");
  }
  const c = document.createElement("div");
  // c.innerHTML = `
  // <p>aaaaaaaaaaaaaaaaaaaaaaaaa</p>
  // `;
  render(<RepositoryConfig />, c);
  b.appendChild(c);
}

const urlChangeObserver = new UrlChangeObserver().start();
urlChangeObserver.onChangeUrl(e => {
  addRepositoryConfigView();
});

window.addEventListener("keyup", e => {
  // Ctrl + ]
  if (e.ctrlKey && e.keyCode === 221) {
    const selection = document.getSelection();
    const focusNode = selection.focusNode as HTMLElement;
    const pos = findPosision(focusNode, selection.toString());
    if (!pos) return;
    const pathInfo = getPath();
    if (!pathInfo) return;
    console.log(pos, pathInfo);
    // TODO custom endpoint
    const endpoint = "http://35.190.199.51";
    chrome.runtime.sendMessage({ type: "getDefinition", params: { ...pathInfo, endpoint, position: pos } }, (res: { path: string, range: DocumentRange }[]) => {
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
