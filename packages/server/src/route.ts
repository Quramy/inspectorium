import express from "express";
import { InspectionService, NotSupportedCapabilityError } from "./service";

function verifyPostionRequest(req: express.Request, res: express.Response) {
  const line = +req.query.line;
  const character = +req.query.character;
  if (line < 0 || character < 0) {
    res.statusCode = 400;
    res.json({ message: "invalid query. line and character must be g.e. 0" });
    res.end();
    return;
  }
  return { line, character };
}

function verifyFilePathRequest(req: express.Request, res: express.Response) {
  const fp = req.params[0] as string;
  if (!fp || !fp.length) {
    res.statusCode = 400;
    res.json({ message: "path should not be empty" });
    res.end();
    return;
  }
  return fp;
}

function handleServiceErrors(err: any, res: express.Response) {
  if (err instanceof NotSupportedCapabilityError) {
    res.json({ message: err.message });
    res.statusCode = 400;
  } else {
    res.json({ message: "internal error" });
    res.statusCode = 500;
  }
  return res.end();
}

export function createRouter({ service }: { service: InspectionService }) {

  const router = express.Router();

  router.get("/hover/*", async (req, res) => {
    const pos = verifyPostionRequest(req, res);
    const filePath = verifyFilePathRequest(req, res);
    if (!pos) return;
    if (!filePath) return;
    try {
      res.json(await service.getHover({ filePath, ...pos }));
      res.statusCode = 200;
      return res.end();
    } catch (err) {
      handleServiceErrors(err, res);
    }
  });

  router.get("/references/*", async (req, res) => {
    const pos = verifyPostionRequest(req, res);
    const filePath = verifyFilePathRequest(req, res);
    if (!pos) return;
    if (!filePath) return;
    try {
      res.json(await service.getReferences({ filePath, ...pos }));
      res.statusCode = 200;
      return res.end();
    } catch (err) {
      handleServiceErrors(err, res);
    }
  });

  router.get("/definition/*", async (req, res) => {
    const pos = verifyPostionRequest(req, res);
    const filePath = verifyFilePathRequest(req, res);
    if (!pos) return;
    if (!filePath) return;
    try {
      res.json(await service.getDefinition({ filePath, ...pos }));
      res.statusCode = 200;
      return res.end();
    } catch (err) {
      handleServiceErrors(err, res);
    }
  });

  return router;
}
