import React from "react";
import { Segment } from "semantic-ui-react";
import ResultsList from "./ResultsList";

/* Container to hold results list and perhaps other components in future */
class ResultsPanel extends React.Component {
  render() {
    const { currentUser } = this.props;
    return (
      <Segment
        tertiary
        style={{ width: "100%", margin: 0 }}
        className="table__segment results__container"
      >
        <ResultsList currentUser={currentUser} />
      </Segment>
    );
  }
}

export default ResultsPanel;
