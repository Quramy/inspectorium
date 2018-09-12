import * as React from "react";
import { render } from "react-dom";

import { DocumentRange } from "../types";
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
