import React from 'react';
import './App.css';

import SidePanel from './SidePanel/SidePanel';
import ResultsPanel from './ResultsPanel/ResultsPanel';
import ActionsPanel from './ActionsPanel/ActionsPanel';
import { connect } from 'react-redux';

import { Grid, Segment } from 'semantic-ui-react';

const App = ({ currentUser }) => (
  <Grid stackable>
      <Grid.Column width={3} textAlign="center">
          <SidePanel currentUser={currentUser} />
      </Grid.Column>
      <Grid.Column width={6} textAlign="center">
          <ResultsPanel currentUser={currentUser} />
      </Grid.Column>
      <Grid.Column width={3}>
          <ActionsPanel />
      </Grid.Column>
  </Grid>
)
const mapStateToProps = state => ({
  currentUser: state.user.currentUser
});

export default connect(mapStateToProps, null)(App);
