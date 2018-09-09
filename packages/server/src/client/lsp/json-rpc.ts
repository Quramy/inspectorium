import { Transform, TransformOptions } from "stream";

export class ParseError extends Error {
}

export class JsonRpc {
  encode(args: object) {
    const payload = JSON.stringify({ ...args, jsonrpc: "2.0" })
    console.log("[send]", payload);
    return "Content-Length: " + payload.length + "\r\n\r\n" + payload
  }

  decode(msg: string) {
    if (!msg.startsWith("Content-Length:")) {
      return new ParseError("message should start with 'Content-Length:'");
    }
    const segments = msg.split("\r\n\r\n");
    if (segments.length !== 2) {
      return new ParseError("invalid format");
    }
    try {
      return JSON.parse(segments[1].trim());
    } catch (e) {
      console.error("fail to parse", msg);
      throw e;
    }
  }
}

export class JsonRpcStream extends Transform {
  private rest?: number;
  private buf?: Buffer;

  constructor(options?: TransformOptions) {
    super(options);
  }

  _transform(chunk: Buffer, enc: string, cb: Function) {
    // console.log("raw:", chunk.toString());
    if (this.rest) {
      this.buf = this.buf ? Buffer.concat([this.buf, chunk]) : chunk;
      if (chunk.length < this.rest) {
        this.rest = this.rest - chunk.length;
        return cb();
      } else {
        this.rest = 0;
        this.push(this.buf);
        this.buf = undefined;
        return cb();
      }
    }

    while (true) {
      const msg = chunk.toString();
      const hit = msg.match(/Content-Length: (\d+)/);

      if (hit) {
        this.rest = +hit[1];
        const offset = msg.indexOf("{");
        // console.log(chunk.length, offset, this.rest);
        if (offset === -1) {
          break;
        }
        if (offset < chunk.length) {
          if (chunk.length > offset + this.rest) {
            this.push(chunk.slice(offset, offset + this.rest));
            chunk = chunk.slice(offset + this.rest, chunk.length);
            // console.log("continue", chunk.toString());
            continue;
          } else {
            this.buf = chunk.slice(offset, chunk.length);
          }
        }
        this.rest = this.rest - (chunk.length - offset);
        if (this.rest <= 0) {
          this.push(this.buf);
          this.buf = undefined;
          this.rest = 0;
        }
      } 
      break;
    }

    return cb();

    throw new Error("Invalid stream state " + chunk.toString());
  }
}
