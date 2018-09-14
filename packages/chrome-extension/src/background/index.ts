import { services } from "./services";

export type Services = typeof services;

type FirstArgs<T> = T extends (a: infer A) => any ? A : never;

chrome.runtime.onMessage.addListener(<K extends keyof Services>(
  req: {
    type: K,
    params: FirstArgs<Services[K]>
  },
  sender: any,
  sendResponse: (result: any) => void
) => {
  console.log(req);
  const { type, params } = req;
  const callback: any = (x: any) => sendResponse(x);
  (services[type](params) as Promise<any>).then(callback);
  return true;
});

