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
  tryMount,
  tryMountRepositoryConfigView,
  findPositionFromSelected,
  findPositionFromCursor,
} from "./lib/gh-functions";
import { HoverViewContainer } from "./containers/hover-view";

const urlChangeObserver = new UrlChangeObserver().start();

const { store, dispatcher } = initStore<AppState>({
  owner: "",
  repository: "",
  endpoint: "",
  currentFile: "",
  refference: "",
  scrollTop: document.querySelector("html")!.scrollTop,
  hoverPosition: null,
  hoverContents: null,
  hoverPoint: null,
});

const actions = defineActions(dispatcher);

urlChangeObserver.onChangeUrl(e => {
  const pathInfo = getRepositoryInfoFromLocation();
  if (!pathInfo) return actions.clearRepoInfo();
  const { owner, repository, currentFile, refference: ref } = store.getState()
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

});

tryMountRepositoryConfigView(
  mountPoint => render(<RepositoryConfigContainer store={store} actions={actions} />, mountPoint)
);

tryMount(hoverMountPoint => render(<HoverViewContainer store={store} actions={actions} />, hoverMountPoint));

document.addEventListener("scroll", debounce(() => {
  const scrollTop = document.querySelector("html")!.scrollTop;
  actions.setScroll(scrollTop);
}, 50));

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
  const pos = findPositionFromCursor(e);
  if (!pos) return actions.clearHover();
  actions.getHover(pos, e.x, e.y);
}, 100));
