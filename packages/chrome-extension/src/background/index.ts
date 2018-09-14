import { services } from "./services";

export type Services = typeof services;

type ResolveType<T> = T extends (...args: any[]) => Promise<infer R> ? R : never;
type FirstArgs<T> = T extends (a: infer A) => any ? A : never;

chrome.runtime.onMessage.addListener(<K extends keyof Services>(
  req: {
    type: K,
    params: FirstArgs<Services[K]>
  },
  sender: any,
  sendResponse: (result: ResolveType<ReturnType<Services[K]>>) => void
) => {
  console.log(req);
  const { type, params } = req;
  services[type](params).then(result => sendResponse(result));
  return true;
});

