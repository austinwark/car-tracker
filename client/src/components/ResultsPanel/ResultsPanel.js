import React from 'react';

import ResultsList from './ResultsList';
//import Create from './Create';

import { Header, Grid, Segment, Icon } from 'semantic-ui-react';

class ResultsPanel extends React.Component {

    render() {

        const { currentUser } = this.props;

        return (
            <Segment tertiary style={{width: "100%", margin: 0}} className="table__segment results__container">
                {/* <h1 style={{textAlign: "center"}}>
                    <Icon name="filter" />
                    Query Results
                </h1> */}
                <ResultsList currentUser={currentUser} />
            </Segment>

        )
    }
}

export default ResultsPanel;