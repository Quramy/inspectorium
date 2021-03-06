#!/usr/bin/env node

import minimist from "minimist";
import fs from "fs";
import { bootstrap } from "./app";

function validateConfig(conf: any) {
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

  const { message } = validateConfig(config);
  if (message) {
    console.error(`Config file "${configFilename}":`, message);
    return process.exit(1);
  }

  bootstrap({
    port: process.env.INSPECTORIUM_PORT || 4000,
    projectRoot: process.env.INSPECTORIUM_PROJECT_ROOT || process.cwd(),
    pathPrefix: process.env.INSPECTORIUM_PATH_PREFIX || "",
    codeVersion: process.env.INSPECTORIUM_CODE_VER || "",
    ...config
  });

}

main();
