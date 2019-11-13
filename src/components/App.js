import React from 'react';
import './App.css';

import SidePanel from './SidePanel/SidePanel';
import ResultsPanel from './ResultsPanel/ResultsPanel';
import MetaPanel from './MetaPanel/MetaPanel';
import { connect } from 'react-redux';

import { Grid } from 'semantic-ui-react';

const App = ({ currentUser, currentQuery }) => (
  <Grid stackable>
      <Grid.Column width={3} textAlign="center" className="main__cols">
          <SidePanel currentUser={currentUser} />
      </Grid.Column>
      <Grid.Column width={9} textAlign="center">
          <ResultsPanel currentUser={currentUser} />
      </Grid.Column>
      <Grid.Column width={4}>
          <MetaPanel currentQuery={currentQuery} currentUser={currentUser} />
      </Grid.Column>
  </Grid>
)
const mapStateToProps = state => ({
  currentUser: state.user.currentUser,
  currentQuery: state.query.currentQuery
});

export default connect(mapStateToProps, null)(App);
