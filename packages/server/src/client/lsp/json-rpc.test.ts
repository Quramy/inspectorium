import assert from "assert";
import { Readable } from "stream";
import { Decoder } from "./json-rpc";

describe("JsonRpcStream", () => {

  it("should decode with 1 msg", async done => {
    const input = new Readable();
    input._read = () => {};
    const jrs = new Decoder();
    const transformed = input.pipe(jrs);
    const payload = JSON.stringify({ "jsonrpc": "2.0" });
    const msg = "Content-Length: " + payload.length + "\r\n\r\n" + payload;
    transformed.once("data", (d: Buffer) => {
      assert.deepEqual(d.toString(), payload);
      done();
    });
    input.push(msg);
  });

  it("should decode with separated msgs(header and body)", async done => {
    const input = new Readable();
    input._read = () => {};
    const jrs = new Decoder();
    const transformed = input.pipe(jrs);
    const payload = JSON.stringify({ "jsonrpc": "2.0" });
    const msg1 = "Content-Length: " + payload.length;
    const msg2 = "\r\n\r\n" + payload;
    transformed.once("data", (d: Buffer) => {
      assert.deepEqual(d.toString(), payload);
      done();
    });
    input.push(msg1);
    input.push(msg2);
  });

  it("should decode with separated msgs(2 fragments)", async done => {
    const input = new Readable();
    input._read = () => {};
    const jrs = new Decoder();
    const transformed = input.pipe(jrs);
    const payload = JSON.stringify({ "jsonrpc": "2.0" });
    const msg1 = "Content-Length: " + payload.length + "\r\n\r\n" + payload.slice(0, 5);
    const msg2 = payload.slice(5);
    transformed.once("data", (d: Buffer) => {
      assert.deepEqual(d.toString(), payload);
      done();
    });
    input.push(msg1);
    input.push(msg2);
  });

  it("should decode with multipule payload in 1msg", async done => {
    const input = new Readable();
    input._read = () => {};
    const jrs = new Decoder();
    const transformed = input.pipe(jrs);
    const payload1 = JSON.stringify({ "jsonrpc": "2.0" });
    const payload2 = JSON.stringify({ "jsonrpc": "2.0" });
    const msg = "Content-Length: " + payload1.length + "\r\n\r\n" + payload1 +
      "\r\nContent-Length: " + payload2.length + "\r\n\r\n" + payload2;
    let callCount = 0;
    transformed.on("data", (d: Buffer) => {
      callCount++;
      if (callCount === 2) done();
    });
    input.push(msg);
  });

});
