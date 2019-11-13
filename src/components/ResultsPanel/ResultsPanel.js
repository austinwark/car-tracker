import React from 'react';

import ResultsList from './ResultsList';
//import Create from './Create';

import { Header, Grid } from 'semantic-ui-react';

class ResultsPanel extends React.Component {

    render() {

        const { currentUser } = this.props;

        return (
            <Grid>
                <Grid.Row>
                    <Grid.Column textAlign="center">
                        <Header as="h1" textAlign="center">Query Results</Header>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <ResultsList currentUser={currentUser} />
                </Grid.Row>
            </Grid>
        )
    }
}

export default ResultsPanel;