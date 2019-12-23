import React from 'react';
import { Icon } from 'semantic-ui-react';
import './App.css';
import query from '../assets/query.svg';
import SidePanel from './SidePanel/SidePanel';
import ResultsPanel from './ResultsPanel/ResultsPanel';
import MetaPanel from './MetaPanel/MetaPanel';
import Notification from './MetaPanel/Notification';
import { toggleMetaPanel, setWindowSize } from '../actions';
import { connect } from 'react-redux';
import WebFont from 'webfontloader';
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
      metaPanelOpen: false,
      windowDimensions: this.getWindowDimensions()
    }
    this.handleMetaDataToggle = this.handleMetaDataToggle.bind(this);
    this.handleSideToggle = this.handleSideToggle.bind(this);
}
  /* Adds listener to watch for window resize */
  componentDidMount() {
    window.addEventListener("resize", this.handleResize);
    // this.props.setWindowSize(this.getWindowDimensions());
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

  /* Updates local state on window resize */
  handleResize = () => {
    const dimensions = this.getWindowDimensions();
    this.props.setWindowSize(dimensions);
  };
  
  handleSideToggle() {
    this.setState({ sidePanelOpen: !this.state.sidePanelOpen, metaPanelOpen: false})
  }
  handleMetaDataToggle() {
    console.log('call')
    this.setState({ metaPanelOpen: !this.state.metaPanelOpen, sidePanelOpen: false });
  }
  render() {

    const { currentNotification, currentQuery, currentUser, isLoading, metaPanelOpen, sidePanelOpen } = this.props;     
    return  (
              <div className="grid__main">
                  {currentNotification && <Notification currentNotification={currentNotification} />}
                  <section className={`main__sidepanel__colors first__column ${sidePanelOpen ? "open__column" : ""}`}>
                      <SidePanel currentQuery={currentQuery} currentUser={currentUser} sidePanelOpen={sidePanelOpen} handleSideToggle={this.handleSideToggle} />
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
