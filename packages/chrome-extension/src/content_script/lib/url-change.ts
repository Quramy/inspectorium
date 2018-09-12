import { EventEmitter } from "events";

export type OnChangeUrlEventType = {
  newUrl: string,
  oldUrl: string,
};

export class UrlChangeObserver {

  private preHref = "";
  private emitter = new EventEmitter();

  start() {
    const cb = () => {
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (location.href !== this.preHref) {
            this.emitter.emit("changeUrl", { newUrl: location.href, oldUrl: this.preHref } as OnChangeUrlEventType);
          }
          this.preHref = location.href;
          cb();
        }, 50);
      });
    };
    cb();
    return this;
  }

  onChangeUrl(cb: (e: OnChangeUrlEventType) => any) {
    this.emitter.on("changeUrl", cb);
  }

}
