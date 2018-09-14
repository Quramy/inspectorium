import { Services } from "../../background";

type FirstArgs<T> = T extends (a: infer A) => any ? A : never;

export function execService<K extends keyof Services>(serviceName: K, params: FirstArgs<Services[K]>) {
  return new Promise(resolve => {
    chrome.runtime.sendMessage({ type: serviceName, params }, res => resolve(res));
  }) as ReturnType<Services[K]>;
} 
