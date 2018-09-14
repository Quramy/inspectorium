import * as React from "react";
import { render } from "react-dom";
import { debounce } from "lodash"
import { DocumentRange } from "@inspectorium/schema";

import { UrlChangeObserver } from "./lib/url-change";
import { initStore } from "./lib/state-management";
import { AppState } from "./app-state";
import { defineActions } from "./actions";
import { RepositoryConfigContainer } from "./containers/repository-config";
import {
  getRepositoryInfoFromLocation,
  tryMountRepositoryConfigView,
  findPositionFromSelected,
} from "./lib/gh-functions";

const urlChangeObserver = new UrlChangeObserver().start();

const { store, dispatcher } = initStore<AppState>({
  owner: "",
  repository: "",
  endpoint: "",
  currentFile: "",
  ref: "",
  hoverPosition: null,
});

const actions = defineActions(dispatcher);

urlChangeObserver.onChangeUrl(e => {
  const pathInfo = getRepositoryInfoFromLocation();
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
    const pos = findPositionFromSelected(focusNode, selection.toString());
    if (!pos) return;
    actions.navigateToDefinition(pos);
  }
});

window.addEventListener("mousemove", debounce((e: MouseEvent) => {
  const { x, y, offsetX } = e;
  const n = document.elementFromPoint(x, y);
  if (!n) return;
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
    if (!afterSpan) return;
    const textNode = afterSpan.previousSibling;
    if (!textNode) return;
    target = textNode;
    text = textNode.nodeValue;
  } else if(n.nodeName === "SPAN" && n.parentElement && n.parentElement.classList.contains("js-file-line")) {
    target = n;
    text = n.textContent;
  }
  if (!target || !text) return;
  const pos = findPositionFromSelected(target as HTMLElement, text);
  if (!pos) return;
  console.log(pos, text);
  actions.getHover(pos);
}, 100));
