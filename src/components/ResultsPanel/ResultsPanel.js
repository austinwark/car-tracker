import React from 'react';

import firebase from '../../firebase';

import ResultsList from './ResultsList';
//import Create from './Create';

import { Header, Segment, Grid } from 'semantic-ui-react';

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
                    <ResultsList />
                </Grid.Row>
                <Grid.Row>
                    {/* <Create currentUser={currentUser} /> */}
                </Grid.Row>
            </Grid>
        )
    }
}

export default ResultsPanel;