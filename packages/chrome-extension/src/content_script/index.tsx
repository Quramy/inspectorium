import * as React from "react";
import { render } from "react-dom";

import { DocumentRange } from "../types";
import { UrlChangeObserver } from "./lib/url-change";
import { initStore } from "./lib/state-management";
import { AppState } from "./app-state";
import { defineActions } from "./actions";
import { RepositoryConfigContainer } from "./containers/repository-config";

const { store, dispatcher } = initStore<AppState>({
  owner: "",
  repository: "",
  currentFile: "",
  ref: "",
  endpoint: ""
});

const actions = defineActions(dispatcher);

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

function tryMountRepositoryConfigView(cb: (mp: Element) => any) {
  const domId = "inspectorium_repository_config";
  if (document.getElementById(domId)) return;
  const mountPoint = document.createElement("div");
  mountPoint.setAttribute("id", domId);
  const ref = document.querySelector(".application-main");
  if (!ref || !ref.nextElementSibling) return;
  ref.parentNode!.insertBefore(mountPoint, ref.nextElementSibling);
  cb(mountPoint);
}

const urlChangeObserver = new UrlChangeObserver().start();

urlChangeObserver.onChangeUrl(e => {
  const pathInfo = getPath();
  if (!pathInfo) return;
  const { owner, repository, currentFile, ref } = store.getState()
  if (pathInfo.owner !== owner || repository !== repository) {
    const endpoint = localStorage.getItem(`${pathInfo.owner}/${pathInfo.repository}/endpoint`);
    actions.initRepoInfo(pathInfo.owner, pathInfo.repository, endpoint || "");
  }
  if (currentFile !== pathInfo.filePath) {
    actions.changeCurrentFile(pathInfo.filePath);
  }
  if (pathInfo.ref !== ref) {
    actions.changeRef(pathInfo.ref);
  }
  tryMountRepositoryConfigView(
    mountPoint => render(<RepositoryConfigContainer store={store} actions={actions} />, mountPoint)
  );
});

window.addEventListener("keyup", e => {
  // Ctrl + ]
  if (e.ctrlKey && e.keyCode === 221) {
    const selection = document.getSelection();
    const focusNode = selection.focusNode as HTMLElement;
    const pos = findPosision(focusNode, selection.toString());
    if (!pos) return;
    const { owner, repository, ref, currentFile: filePath, endpoint } = store.getState();
    console.log(filePath, ref, pos);
    chrome.runtime.sendMessage({ type: "getDefinition", params: { filePath, ref, endpoint, position: pos } }, (res: { path: string, range: DocumentRange }[]) => {
      console.log(res);
      if (!res.length) {
        // TODO handle empty result
        return;
      }
      const { path, range } = res[0];
      if (path === filePath) {
        location.hash = `L${range.start.line + 1}`;
      } else {
        location.href= `/${owner}/${repository}/blob/${ref}/${path}#L${range.start.line + 1}`
      }
    });
  }
});
