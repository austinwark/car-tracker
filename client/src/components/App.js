import React from 'react';
import './App.css';

import SidePanel from './SidePanel/SidePanel';
import ResultsPanel from './ResultsPanel/ResultsPanel';
import MetaPanel from './MetaPanel/MetaPanel';
import Notification from './MetaPanel/Notification';
import { connect } from 'react-redux';
import WebFont from 'webfontloader';
import { Grid } from 'semantic-ui-react';
// ({ currentUser, currentQuery, isLoading, currentNotification })
WebFont.load({
  google: {
    families: ['Inconsolata:400,700', 'Asap:400,700', 'Montserrat:400,500,700', 'sans-serif', 'monospace']
  }
});
class App extends React.Component {

  render() {

    const { currentNotification, currentQuery, currentUser, isLoading } = this.props;     
    return  (
              <Grid stackable>
                  {currentNotification && <Notification currentNotification={currentNotification} />}
                  <Grid.Column width={3} textAlign="center" className="main__sidepanel__colors no__padding__bottom first__column">
                      <SidePanel currentQuery={currentQuery} currentUser={currentUser} />
                  </Grid.Column>
                  <Grid.Column width={9} textAlign="center" className="no__padding__bottom middle__column">
                      <ResultsPanel currentUser={currentUser} />
                  </Grid.Column>
                  <Grid.Column width={4} className="no__padding__bottom last__column">
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
