import React from 'react';
import './App.css';
import '../bootstrap.css'

import SidePanel from './SidePanel/SidePanel';
import ResultsPanel from './ResultsPanel/ResultsPanel';
import ActionsPanel from './ActionsPanel/ActionsPanel';
import { connect } from 'react-redux';

const App = ({ currentUser }) => (
  <div className='container-fluid p-0 app__main'>
    <div className="row app__main">

      {/* Side Panel */}
      <div className='col-12 col-lg-3 p-0'>
        <SidePanel currentUser={currentUser} />
      </div>

      {/* Query Results */}
      <div className='col-12 col-lg-6'>
        <ResultsPanel currentUser={currentUser} />
      </div>

      {/* Query Actions */}
      <div className='col-12 col-lg-3'>
        <ActionsPanel />
      </div>
    </div>
  </div>
)
const mapStateToProps = state => ({
  currentUser: state.user.currentUser
});

export default connect(mapStateToProps, null)(App);
