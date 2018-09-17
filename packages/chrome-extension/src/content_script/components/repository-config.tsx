import * as React from "react";
import cx from "classnames";
import * as styles from "./repository-config.css";

type Props = {
  owner: string,
  repository: string,
  refference: string,
  endpoint: string,
  changeEndpoint: (v: string) => void,
};

export const RepositoryConfig = (props: Props) => {
  const { owner, repository, refference, changeEndpoint, endpoint } = props;
  if (!owner || !repository || !refference) return null;
  return (
    <div className={cx(styles.root, "container")}>
      <div>
        <input
          type="text"
          className="form-group form-control"
          placeholder="endpoint"
          value={endpoint}
          onChange={e => changeEndpoint(e.target.value)}
        />
      </div>
    </div>
  );
};
