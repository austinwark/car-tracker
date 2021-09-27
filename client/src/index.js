import * as serviceWorker from "./serviceWorker";
import React from "react";
import ReactDOM from "react-dom";
import { createStore, applyMiddleware, compose } from "redux";
import { Provider, connect } from "react-redux";
import "semantic-ui-css/semantic.min.css";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  withRouter
} from "react-router-dom";
import App from "./components/App";
import Register from "./components/Auth/Register";
import Login from "./components/Auth/Login";
import Spinner from "./components/Spinner";
import rootReducer from "./reducers";
import { setUser, clearUser, setCurrentQuery } from "./actions";
import "./components/App.css";
const firebase = require("./firebase");
const moment = require("moment");

/* Used to allow redux devtools chrome extension */
const composeEnhancers =
  typeof window === "object" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        trace: true,
        traceLimit: 20
      })
    : compose;

const enhancer = composeEnhancers(applyMiddleware());

const store = createStore(rootReducer, enhancer);

class Root extends React.Component {
  /* Watches for changes in firebase auth and updates database accordingly */
  componentDidMount() {
    firebase.auth().onIdTokenChanged(user => {
      if (user) {
        // --if a user is signed in
        const isAnonymous = user.isAnonymous;
        if (!isAnonymous) {
          // --if user is not anonymous, update database with email verification result and last sign-in date
          if (user.emailVerified) {
            firebase
              .database()
              .ref("users")
              .child(user.uid)
              .update({
                emailVerified: true,
                lastSignIn: moment().format("L")
              });
          } else {
            // --else set email verified field to false and update last sign-in date
            firebase
              .database()
              .ref("users")
              .child(user.uid)
              .update({
                emailVerified: false,
                lastSignIn: moment().format("L")
              });
          }
          user.reload();
        }
        this.props.setUser(user); // saves user info in global state

        firebase
          .database()
          .ref("queries")
          .child(user.uid)
          .once("value", snap => {
            // --> checks if user has any queries saved in database
            if (snap.val()) {
              const firstQuery = Object.entries(snap.val())[0][1];
              this.props.setCurrentQuery(firstQuery);
            } else {
              this.props.setCurrentQuery(null);
            }
          });
        this.props.history.push("/"); // pushes user to app homepage on signin
        this.props.history.push("/");
      } else {
        // --else if a user is not signed in, push to login page
        this.props.history.push("/login");
        this.props.clearUser(); // clears user info in global state
      }
    });
  }

  render() {
    return this.props.isLoading ? (
      <Spinner message="Preparing app" />
    ) : (
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
});

const RootWithAuth = withRouter(
  connect(mapStateToProps, { setUser, clearUser, setCurrentQuery })(Root)
);

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <RootWithAuth />
    </Router>
  </Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
