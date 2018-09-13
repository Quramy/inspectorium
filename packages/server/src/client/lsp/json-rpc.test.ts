import assert from "assert";
import { Readable } from "stream";
import { JsonRpcStream } from "./json-rpc";

describe("JsonRpcStream", () => {
  it("should decode", async done => {
    const s = new Readable();
    s._read = () => {};
    const jrs = new JsonRpcStream();
    const x = s.pipe(jrs);
    const payload = JSON.stringify({ "jsonrpc": "2" });
    s.push("Content-Length: " + payload.length + "\r\n\r\n" + payload);
    x.once("data", (d: Buffer) => {
      assert.deepEqual(d.toString(), payload);
      done();
    });
  });
});
