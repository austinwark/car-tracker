import React from 'react';
import './App.css';

import SidePanel from './SidePanel/SidePanel';
import ResultsPanel from './ResultsPanel/ResultsPanel';
import ActionsPanel from './ActionsPanel/ActionsPanel';
import { connect } from 'react-redux';

import { Grid } from 'semantic-ui-react';

const App = ({ currentUser, currentQuery }) => (
  <Grid stackable>
      <Grid.Column width={3} textAlign="center">
          <SidePanel currentUser={currentUser} />
      </Grid.Column>
      <Grid.Column width={9} textAlign="center">
          <ResultsPanel currentUser={currentUser} />
      </Grid.Column>
      <Grid.Column width={4}>
          <ActionsPanel />
      </Grid.Column>
  </Grid>
)
const mapStateToProps = state => ({
  currentUser: state.user.currentUser,
  currentQuery: state.query.currentQuery
});

export default connect(mapStateToProps, null)(App);
