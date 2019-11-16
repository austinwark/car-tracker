import React from 'react';
import './App.css';

import SidePanel from './SidePanel/SidePanel';
import ResultsPanel from './ResultsPanel/ResultsPanel';
import MetaPanel from './MetaPanel/MetaPanel';
import Notification from './MetaPanel/Notification';
import { connect } from 'react-redux';

import { Grid } from 'semantic-ui-react';
// ({ currentUser, currentQuery, isLoading, currentNotification })
class App extends React.Component {

  render() {

    const { currentNotification, currentQuery, currentUser, isLoading } = this.props;     
    return  (
              <Grid stackable>
                  {currentNotification && <Notification currentNotification={currentNotification} />}
                  <Grid.Column width={3} textAlign="center" className="main__cols">
                      <SidePanel currentQuery={currentQuery} currentUser={currentUser} />
                  </Grid.Column>
                  <Grid.Column width={9} textAlign="center">
                      <ResultsPanel currentUser={currentUser} />
                  </Grid.Column>
                  <Grid.Column width={4}>
                      <MetaPanel currentQuery={currentQuery} currentUser={currentUser} isLoading={isLoading} />
                  </Grid.Column>
              </Grid>
            )
    }
  }
const mapStateToProps = state => ({
  currentUser: state.user.currentUser,
  currentQuery: state.query.currentQuery,
  isLoading: state.query.isLoading,
  currentNotification: state.notification.currentNotification
});

export default connect(mapStateToProps, null)(App);
