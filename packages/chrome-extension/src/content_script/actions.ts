import { DocumentPosition, DocumentRange } from "../types";
import { Dispatcher } from "./lib/state-management";
import { AppState } from "./app-state";
import { execService } from "./lib/exec-service";

export function defineActions(dispatcher: Dispatcher<AppState>) {

  const { dispatch, getCurrentState } = dispatcher;

  return {

    initRepoInfo(owner: string, repository: string, endpoint: string) {
      dispatch(() => {
        console.log("initRepoInfo", getCurrentState());
        return { ...getCurrentState(), owner, repository, endpoint };
      });
    },

    changeCurrentFile(currentFile: string) {
      dispatch(() => ({ ...getCurrentState(), currentFile }));
    },

    changeRef(ref: string) {
      dispatch(() => ({ ...getCurrentState(), ref }));
    },

    changeEndpoint(endpoint: string) {
      const { owner, repository } = getCurrentState();
      localStorage.setItem(`${owner}/${repository}/endpoint`, endpoint || "");
      dispatch(() => ({ ...getCurrentState(), endpoint }));
    },

    async navigateToDefinition(pos: DocumentPosition) {
      const { owner, repository, ref, currentFile: filePath, endpoint } = getCurrentState();
      console.log(filePath, ref, pos);
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

    async getHover(pos: DocumentPosition) {
      const { owner, repository, ref, currentFile: filePath, endpoint } = getCurrentState();
      dispatch(() => ({ ...getCurrentState(), hoverPosition: pos }));
      const res = await execService("getHover", { filePath, ref, endpoint, position: pos });
      const currentPos = getCurrentState().hoverPosition;
      if (!currentPos || pos.line !== currentPos.line || pos.character !== currentPos.character) return;
      console.log(res);
    },

  };
}

export type Actions = ReturnType<typeof defineActions>;
