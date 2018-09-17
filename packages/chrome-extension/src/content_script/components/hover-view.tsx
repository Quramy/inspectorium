import * as React from "react";
import * as cx from "classnames";
import * as styles from "./hover-view.css";
import {
  GetHoverResponse,
} from "@inspectorium/schema";

type Props = {
  scrollTop: number,
  hoverPoint: { x: number, y: number } | null,
  hoverContents: GetHoverResponse["contents"] | null,
};

export const HoverView = (props: Props) => {
  const { scrollTop, hoverContents, hoverPoint } = props;
  if (!hoverContents || !hoverPoint) return null;
  const text = hoverContents.map(c => {
    if (typeof c === "string") return c;
    if (c.value) return c.value;
    return "";
  }).filter(t => !!t).join("\n");
  if (!text.trim()) return null;
  const top = hoverPoint.y + scrollTop - 10;
  return (
    <div style={{ position: "absolute", left: hoverPoint.x, top }}>
      <div className={styles.outer}>
        <pre className={styles.contents}>{text}</pre>
      </div>
    </div>
  );
};
