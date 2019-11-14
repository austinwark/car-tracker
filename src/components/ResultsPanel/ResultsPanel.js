import React from 'react';

import ResultsList from './ResultsList';
//import Create from './Create';

import { Header, Grid, Segment, Icon } from 'semantic-ui-react';

class ResultsPanel extends React.Component {

    render() {

        const { currentUser } = this.props;

        return (
            <Grid>
                <Grid.Row>
                    <Grid.Column textAlign="center">
                        <Segment raised className="top__segment">
                            <Header as="h1" textAlign="center">
                                <Icon name='filter' />
                                Query Results
                            </Header>
                        </Segment>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row style={{paddingTop: 0}}>
                    <Grid.Column>
                        <Segment raised style={{width: "100%"}} className="table__segment table__container">
                            <ResultsList currentUser={currentUser} />
                        </Segment>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        )
    }
}

export default ResultsPanel;