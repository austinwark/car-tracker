import React, { createRef } from "react";
import { Popup, Icon } from "semantic-ui-react";
import { setCurrentNotification } from "../../actions";
import { connect } from "react-redux";

/* Notification component used to pass short messages to user */
class Notification extends React.Component {
  state = {
    open: true,
    timeoutId: ""
  };
  contextRef = createRef();

  /* Starts a self destruction timer for one minute */
  componentDidMount() {
    const timeoutId = setTimeout(() => {
      this.clearNotification();
    }, 60000);
    this.setState({ timeoutId });
  }

  /* On unmount, timeout will be cleared and notification destroyed */
  componentWillUnmount() {
    this.clearNotification();
  }

  /* Helper function to clear timeout and destroy notification */
  clearNotification = () => {
    clearTimeout(this.state.timeoutId);
    this.setState({ open: false, timeoutId: "" });
    this.props.setCurrentNotification(null); // updates global state
  };

  /* Uses passed in props to display message */
  render() {
    const { currentNotification } = this.props;
    return (
      <React.Fragment>
        <div ref={this.contextRef} className="notification__message"></div>
        <Popup
          context={this.contextRef}
          position="left center"
          basic
          open={this.state.open}
          closeOnEscape
        >
          {currentNotification}{" "}
          <Icon
            name="close"
            id="notification__close"
            onClick={() => this.clearNotification()}
          />
        </Popup>
      </React.Fragment>
    );
  }
}

export default connect(null, { setCurrentNotification })(Notification);
