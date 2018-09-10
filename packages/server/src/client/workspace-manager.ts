import fs from "fs";
import path from "path";

function readFile(absPath: string) {
  return new Promise<string>((resolve, reject) => {
    fs.readFile(absPath, "utf8", (err, contents) => {
      if (err) return reject(err);
      resolve(contents);
    });
  });
}

export class WorkspaceManager {

  readonly projectRoot: string;

  private fileMap = new Map<string, boolean>();

  constructor({ projectRoot }: { projectRoot: string }) {
    this.projectRoot = projectRoot;
  }

  filePath2AbsPath(filePath: string) {
    return path.join(this.projectRoot, filePath);
  }

  filePath2Uri(filePath: string) {
    return `file://${this.filePath2AbsPath(filePath)}`;
  }

  uri2FilePath(uri: string) {
    const absPath = uri.replace(/^file:\/\//, "");
    return path.relative(this.projectRoot, absPath);
  }

  async open(filePath: string, delegate: (documentUri: string, contents: string) => Promise<any>) {
    const absPath = this.filePath2AbsPath(filePath);
    const documentUri = this.filePath2Uri(filePath);
    if (this.fileMap.has(documentUri)) {
      return documentUri;
    }
    const contents = await readFile(absPath);
    await delegate(documentUri, contents);
    this.fileMap.set(documentUri, true);
    return documentUri;
  }
}
