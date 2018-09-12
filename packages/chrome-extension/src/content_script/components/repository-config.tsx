import * as React from "react";
import cx from "classnames";
import * as styles from "./repository-config.css";

type Props = {
  endpoint: string,
  changeEndpoint: (v: string) => void,
};

export const RepositoryConfig = ({ endpoint, changeEndpoint }: Props) => {
  return (
    <div className={cx(styles.root, "container")}>
      <div>
        <input
          type="text"
          placeholder="endpoint"
          value={endpoint}
          onChange={e => changeEndpoint(e.target.value)}
        />
      </div>
    </div>
  );
};
