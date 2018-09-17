import { DocumentPosition, DocumentRange } from "@inspectorium/schema";
import { Dispatcher } from "./lib/state-management";
import { AppState } from "./app-state";
import { execService } from "./lib/exec-service";

export function defineActions(dispatcher: Dispatcher<AppState>) {

  const { dispatch, getCurrentState } = dispatcher;

  return {

    initRepoInfo(owner: string, repository: string, endpoint: string) {
      dispatch(() => ({ ...getCurrentState(), owner, repository, endpoint }));
    },

    clearRepoInfo() {
      dispatch(() => ({ ...getCurrentState(), owner: "", repository: "", refference: "" }));
    },

    changeCurrentFile(currentFile: string) {
      dispatch(() => ({ ...getCurrentState(), currentFile }));
    },

    changeRef(ref: string) {
      dispatch(() => ({ ...getCurrentState(), refference: ref  }));
    },

    changeEndpoint(endpoint: string) {
      const { owner, repository } = getCurrentState();
      localStorage.setItem(`${owner}/${repository}/endpoint`, endpoint || "");
      dispatch(() => ({ ...getCurrentState(), endpoint }));
    },

    async navigateToDefinition(pos: DocumentPosition) {
      const { owner, repository, refference: ref, currentFile: filePath, endpoint } = getCurrentState();
      const res = await execService("getDefinition", { filePath, ref, endpoint, position: pos });
      console.log(res);
      if (!res.length) {
        // TODO handle empty result
        return;
      }
      const { path, range } = res[0];
      if (path === filePath) {
        location.hash = `L${range.start.line + 1}`;
      } else {
        location.href= `/${owner}/${repository}/blob/${ref}/${path}` + "#" + `L${range.start.line + 1}`;
      }
    },

    setScroll(scrollTop: number) {
      dispatch(() => ({ ...getCurrentState(), scrollTop }));
    },

    clearHover() {
      dispatch(() => ({ ...getCurrentState(), hoverPosition: null, hoverContents: null, hoverPoint: null }));
    },

    async getHover(pos: DocumentPosition, x: number, y: number) {
      const { owner, repository, refference, currentFile: filePath, endpoint } = getCurrentState();
      dispatch(() => ({ ...getCurrentState(), hoverPosition: pos }));
      const res = await execService("getHover", { filePath, ref: refference, endpoint, position: pos });
      const currentPos = getCurrentState().hoverPosition;
      if (!currentPos || pos.line !== currentPos.line || pos.character !== currentPos.character) return;
      if (!res.contents) {
        dispatch(() => ({ ...getCurrentState(), hoverContents: null, hoverPoint: null }));
      } else {
        dispatch(() => ({ ...getCurrentState(), hoverContents: res.contents, hoverPoint: { x, y } }));
      }
    },

  };
}

export type Actions = ReturnType<typeof defineActions>;
