import express from "express";
import { InspectionService } from "./service";

export function createRouter({ service }: { service: InspectionService }) {

  const router = express.Router();

  router.get("/definition/*", async (req, res) => {
    const line = +req.query.line;
    const character = +req.query.character;
    if (line < 0 || character < 0) {
      res.statusCode = 400;
      res.json({ message: "invalid query. line and character must be g.e. 0" });
      return res.end();
    }
    const fp = req.params[0] as string;
    if (!fp || !fp.length) {
      res.statusCode = 400;
      res.json({ message: "path should not be empty" });
      return res.end();
    }
    try {
      const result = await service.getDefinition({
        filePath: fp,
        line,
        character,
      });
      res.statusCode = 200;
      res.json(result);
      return res.end();
    } catch (err) {
      res.json({ message: "internal error" });
      res.statusCode = 500;
      return res.end();
    }
  });

  return router;
}
