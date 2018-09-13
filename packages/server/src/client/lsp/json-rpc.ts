import { Transform, TransformOptions } from "stream";

export class JsonRpc {
  encode(args: object) {
    const payload = JSON.stringify({ ...args, jsonrpc: "2.0" })
    console.log("[send]", payload);
    return "Content-Length: " + payload.length + "\r\n\r\n" + payload
  }
}

export class Encoder extends Transform {
  _transform(chunk: Buffer, enc: string, cb: Function) {
    const p = chunk.toString();
    const msg = "Content-Length: " + p.length + "\r\n\r\n" + p;
    console.log(msg);
    this.push(p);
    cb();
  }
}

type Mode = "header" | "length" | "preBody" | "body" | null;

export class Decoder extends Transform {
  private mode: Mode = null;
  private length = 0;
  private buf = "";

  _transform(chunk: Buffer, enc: string, cb: Function) {
    const msg = chunk.toString();
    for (let i = 0; i < msg.length; i++) {
      const c = msg[i];
      if (!this.mode) {
        if (c === "C") this.mode = "header"; 
      }
      if (this.mode === "header") {
        if (this.buf === "Content-Length: ") {
          this.mode = "length";
          this.buf = "";
        } else {
          this.buf = this.buf + c;
        }
      }
      if (this.mode === "length") {
        const code = c.charCodeAt(0);
        if (code < 48 || code > 57) {
          this.mode = "preBody"; 
          this.length = +this.buf;
          this.buf = "";
        } else {
          this.buf = this.buf + c;
        }
      }
      if (this.mode === "preBody") {
        if (c === "{") {
          this.mode = "body";
        }
      }
      if (this.mode === "body") {
        if (this.length - this.buf.length > msg.length - i) {
          this.buf = this.buf + msg.slice(i);
          break;
        } else {
          const p = this.buf + msg.slice(i, i + this.length - this.buf.length);
          this.push(p);
          i = i + this.length - this.buf.length;
          this.buf = "";
          this.mode = null;
        }
      }
    }
    cb();
  }
}
