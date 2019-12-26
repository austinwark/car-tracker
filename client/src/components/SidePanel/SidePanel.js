import React from "react";
import { Segment, Divider } from "semantic-ui-react";
import UserPanel from "./UserPanel";
import CurrentQueries from "./CurrentQueries";
import Create from "./Create";

/* Container component */
class SidePanel extends React.Component {
  render() {
    const {
      currentUser,
      currentQuery,
      sidePanelOpen,
      handleSideToggle
    } = this.props;
    return (
      <Segment
        tertiary
        style={{ height: "100%", margin: 0 }}
        className="sidepanel__main"
        id="main__sidepanel__colors"
      >
        <section>
          <UserPanel currentUser={currentUser} />
          <Divider />
          <Create currentUser={currentUser} />
        </section>
        <section>
          <CurrentQueries
            currentQuery={currentQuery}
            currentUser={currentUser}
            sidePanelOpen={sidePanelOpen}
            handleSideToggle={handleSideToggle}
          />
          <Create currentUser={currentUser} />
        </section>
      </Segment>
    );
  }
}

export default SidePanel;
