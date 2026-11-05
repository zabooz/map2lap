import {Component, type ReactNode} from "react";
import styles from "./ErrorBoundary.module.css";

/** Shows a failure of its children (no WebGL, say) instead of an empty page. */
export class ErrorBoundary extends Component<{children: ReactNode; message: string}, {failed: string | null}> {
  state = {failed: null};

  static getDerivedStateFromError(e: Error) {
    return {failed: e.message};
  }

  render() {
    if (this.state.failed === null) return this.props.children;
    return <div className={styles.failed}><p className="empty">{this.props.message}: {this.state.failed}</p></div>;
  }
}
