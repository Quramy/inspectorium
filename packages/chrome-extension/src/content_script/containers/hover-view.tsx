import * as React from "react";
import { Fragment } from "react";
import { Store } from "../lib/state-management";
import { AppState } from "../app-state";
import { Actions } from "../actions";
import { HoverView } from "../components/hover-view";

type Props = {
  store: Store<AppState>,
  actions: Actions,
}

export class HoverViewContainer extends React.Component<Props, AppState>{

  constructor(props: Props) {
    super(props);
    this.state = props.store.getState();
    props.store.onStateChange(s => this.setState(s));
  }

  render() {
    const props = { ...this.state, ...this.props.actions };
    return (
      <Fragment>
        <HoverView {...props} />
      </Fragment>
    );
  }
}
