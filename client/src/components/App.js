import React from 'react';
import './App.css';
import metadata from "../assets/metadata.svg";
import query from '../assets/query.svg';
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
    families: ['Inconsolata:400,700', 'Asap:400,700', 'Montserrat:400,500,700', 'Open Sans:400,500,600', 'Roboto Slab:400,500,700', 'sans-serif', 'monospace']
  }
});
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sidePanelOpen: false,
      metaPanelOpen: false
    }

    this.handleMetaDataToggle = this.handleMetaDataToggle.bind(this);
    this.handleSideToggle = this.handleSideToggle.bind(this);
}
  
  handleSideToggle() {
    this.setState({ sidePanelOpen: !this.state.sidePanelOpen, metaPanelOpen: false})
  }
  handleMetaDataToggle() {
    console.log('call')
    this.setState({ metaPanelOpen: !this.state.metaPanelOpen, sidePanelOpen: false });
  }
  render() {

    const { currentNotification, currentQuery, currentUser, isLoading } = this.props;     
    return  (
              <div className="grid__main">
                  {currentNotification && <Notification currentNotification={currentNotification} />}
                  <section className={`main__sidepanel__colors first__column ${this.state.sidePanelOpen ? "open__column" : ""}`}>
                      <SidePanel currentQuery={currentQuery} currentUser={currentUser} sidePanelOpen={this.state.sidePanelOpen} handleSideToggle={this.handleSideToggle} />
                      <img src={query} className="query__icon" onClick={this.handleSideToggle} />
                  </section>
                  <section className="middle__column">
                      <ResultsPanel currentUser={currentUser} />
                  </section>
                  <section className={` last__column ${this.state.metaPanelOpen ? "open__column" : ""}`} id="last__column">
                      <MetaPanel currentQuery={currentQuery} currentUser={currentUser} isLoading={isLoading} />
                      <img src={metadata} className="metadata__icon" onClick={this.handleMetaDataToggle} />
                  </section>
              </div>
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
