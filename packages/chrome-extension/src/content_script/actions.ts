import { Dispatcher } from "./lib/state-management";
import { AppState } from "./app-state";

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

  };
}

export type Actions = ReturnType<typeof defineActions>;
