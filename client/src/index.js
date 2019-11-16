import * as serviceWorker from './serviceWorker';

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Switch, Route, withRouter } from 'react-router-dom';

import App from './components/App';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import Spinner from './Spinner';

import 'semantic-ui-css/semantic.min.css';

import firebase from './firebase';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider, connect } from 'react-redux';
import rootReducer from './reducers';
import { setUser, clearUser, setCurrentQuery } from './actions';

const composeEnhancers =
	typeof window === "object" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
		? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
			trace: true,
			traceLimit: 20
		})
		: compose;

const enhancer = composeEnhancers(applyMiddleware());

const store = createStore(rootReducer, enhancer);

/*
import { createStore, applyMiddleware, compose } from "redux";
import reduxThunk from "redux-thunk";
import rootReducer from "./reducers/index";

const composeEnhancers =
  typeof window === "object" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
        trace: true,
        traceLimit: 20
      })
    : compose;

const enhancer = composeEnhancers(applyMiddleware(reduxThunk));

const store = createStore(rootReducer, enhancer);

export default store;
*/
class Root extends React.Component {
	componentDidMount() {
		//console.log(this.props.isLoading)
		// const initialQuery = {
		// 	isDefault: true,
		// 	results: {
		// 		arr: []
		// 	}
		// }
		firebase.auth().onIdTokenChanged((user) => {
			if (user) {
				this.props.setUser(user);
				/* Handles email update bug where index would reset currentQuery on Auth Change and CurrentQueries would not pick up on it */
				firebase.database().ref('queries').child(user.uid).once('value', snap => {	// --> checks if user has any queries saved in database
					if (snap.val()) {
						const firstQuery = Object.entries(snap.val())[0][1];
						this.props.setCurrentQuery(firstQuery);
					} else {
						this.props.setCurrentQuery(null);
					}
				})
				this.props.history.push('/');
			} else {
				this.props.history.push('/login');
				this.props.clearUser();
			}
		});
	}

	render() {
		return this.props.isLoading ? <Spinner message="Preparing app" /> : (
			<Switch>
				<Route exact path="/" component={App} />
				<Route path="/login" component={Login} />
				<Route path="/register" component={Register} />
			</Switch>
		);
	}
}

const mapStateToProps = state => ({
	isLoading: state.user.isLoading,
	currentQuery: state.query.currentQuery
})

const RootWithAuth = withRouter(
    connect(
        mapStateToProps,
        { setUser, clearUser, setCurrentQuery }
        )(Root)
    );

ReactDOM.render(
	<Provider store={store}>
		<Router>
			<RootWithAuth />
		</Router>
	</Provider>,
	document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
