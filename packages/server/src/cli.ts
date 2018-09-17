#!/usr/bin/env node

import minimist from "minimist";
import fs from "fs";
import { bootstrap } from "./app";

function valiidateConf(conf: any) {
  if (!conf.languageServer) {
    return { message: "key 'languageServer' is not set." };
  }
  if (!conf.languageServer.command) {
    return { message: "key 'languageServer.command' is not set." };
  }
  return {};
}

function main() {

  const argv = minimist(process.argv.slice(2), {
    alias: {
      c: "config",
    }
  });

  const configFilename = argv.config || "inspectorium.yml";
  try {
    fs.statSync(configFilename);
  } catch (e) {
    console.error(`Config file "${configFilename}" is not found.`);
    process.exit(1);
    return;
  }
  const config = require("js-yaml").safeLoad(fs.readFileSync(configFilename, "utf8"));

  const { message } = valiidateConf(config);
  if (message) {
    console.error(`Config file "${configFilename}":`, message);
    return process.exit(1);
  }

  bootstrap({
    port: 4000,
    projectRoot: process.cwd(),
    ...config
  });

}

main();
