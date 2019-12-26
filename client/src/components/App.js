import React from 'react';
import { connect } from 'react-redux';
import WebFont from 'webfontloader';
import { Icon } from 'semantic-ui-react';
import SidePanel from './SidePanel/SidePanel';
import ResultsPanel from './ResultsPanel/ResultsPanel';
import MetaPanel from './MetaPanel/MetaPanel';
import Notification from './MetaPanel/Notification';
import { toggleMetaPanel, setWindowSize } from '../actions';
import './App.css';

WebFont.load({
  google: {
    families: ['Montserrat:400,500,700', 'Open Sans:400,500,600', 'sans-serif']
  }
});

/* Main container component - parent to all components */
class App extends React.Component {

  /* Adds listener to watch for window resize and updates global state with dimensions */
  componentDidMount() {
    window.addEventListener("resize", this.handleResize);
    const dimensions = this.getWindowDimensions();
    this.props.setWindowSize(dimensions)
  }
  /* Removes window resize listener */
  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  }

  /* Retrieves window dimensions from the window API */
  getWindowDimensions = () => {
    const { innerWidth: width, innerHeight: height } = window;
    return {
      width,
      height
    };
  };

  /* Updates global state on window resize */
  handleResize = () => {
    const dimensions = this.getWindowDimensions();
    this.props.setWindowSize(dimensions);
  };

  render() {

    const { currentNotification, currentQuery, currentUser, isLoading, metaPanelOpen, sidePanelOpen } = this.props;     
    return  (
              <div className="grid__main">
                  {currentNotification && <Notification currentNotification={currentNotification} />}
                  <section className={`first__column ${sidePanelOpen ? "open__column" : ""}`}>
                      <SidePanel currentQuery={currentQuery} currentUser={currentUser} sidePanelOpen={sidePanelOpen} />
                  </section>
                  <section className="middle__column">
                      <ResultsPanel currentUser={currentUser} />
                  </section>
                  <section className={` last__column ${metaPanelOpen ? "open__column" : ""}`} id="last__column">
                      <MetaPanel currentQuery={currentQuery} currentUser={currentUser} isLoading={isLoading} />
                      <Icon name="window close" className="metapanel__close" onClick={this.props.toggleMetaPanel} />
                  </section>
              </div>
            )
    }
  }
const mapStateToProps = state => ({
  currentUser: state.user.currentUser,
  currentQuery: state.query.currentQuery,
  isLoading: state.query.isLoading,
  currentNotification: state.notification.currentNotification,
  sidePanelOpen: state.panel.sidePanelOpen,
  metaPanelOpen: state.panel.metaPanelOpen
});

export default connect(mapStateToProps, { toggleMetaPanel, setWindowSize })(App);
