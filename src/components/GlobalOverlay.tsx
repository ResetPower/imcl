import { Component } from "react";
import { EmptyProps } from "../tools/types";
import { subscribe, unsubscribe } from "../renderer/session";
import { getOverlay, overlayStack } from "../renderer/overlay";

export interface GlobalOverlayState {
  show: boolean;
}

export default class GlobalOverlay extends Component<EmptyProps, GlobalOverlayState> {
  state: GlobalOverlayState = {
    show: false,
  };
  subscribeIndex = 0;
  constructor(props: EmptyProps) {
    super(props);
    this.subscribeIndex = subscribe("global-overlay", (arg) => {
      arg === "updated" && this.setState({ show: overlayStack.length !== 0 });
    });
  }
  componentWillUnmount() {
    unsubscribe(this.subscribeIndex);
  }
  render() {
    return (
      <div
        className={`flex fixed pin inset-0 z-50 overflow-auto bg-black bg-opacity-50 ${
          !this.state.show ? "hidden" : ""
        }`}
      >
        {getOverlay()}
      </div>
    );
  }
}
