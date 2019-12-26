import React from "react";
import { connect } from "react-redux";
import { Icon } from "semantic-ui-react";
import { setCurrentQuery, toggleSidePanel } from "../../actions";
const firebase = require("../../firebase");

/* List component that contains list of user's queries and is used to switch between them */
class CurrentQueries extends React.Component {
  state = {
    currentUser: this.props.currentUser,
    queriesRef: firebase.database().ref(`queries`),
    activeQuery: "",
    queries: []
  };

  /* Add listeners for new and updated queries in firebase */
  componentDidMount() {
    this.addNewQueryListener();
    this.addChangedQueryListener();
  }

  /* Remove query listeners on component unmount */
  componentWillUnmount() {
    this.removeListeners();
  }

  /* Performs shallow comparison of current and incoming props and updates state if props have changed */
  componentDidUpdate(prevProps) {
    if (
      JSON.stringify(this.props.currentQuery) !==
      JSON.stringify(prevProps.currentQuery)
    ) {
      this.setState({ activeQuery: this.props.currentQuery.id });
    }
  }

  /* Removes all query listeners in firebase */
  removeListeners = () => {
    const { currentUser, queriesRef } = this.state;
    queriesRef.child(currentUser.uid).off();
  };

  /* Listens for changes on queries in firebase (e.g. autoEmails is disabled) and updates global state */
  addChangedQueryListener = () => {
    const { currentUser, queriesRef } = this.state;
    queriesRef.child(currentUser.uid).on("child_changed", snap => {
      const changedQuery = snap.val();
      if (changedQuery.id && changedQuery.name) {
        this.props.setCurrentQuery(changedQuery);
      }
    });
  };

  /* Listens for a deleted query in firebase and updates local state, i.e. the list of queries is updated */
  addRemovedQueryListener = () => {
    const { currentUser, queriesRef } = this.state;
    queriesRef.child(currentUser.uid).on("child_removed", snap => {
      const { queries } = this.state;
      const updatedQueries = queries.filter(quer => quer.id !== snap.val().id); // -> remove deleted query from local state
      this.setState({ queries: updatedQueries });
      updatedQueries.length > 0
        ? this.changeCurrentQuery(updatedQueries[0])
        : this.props.setCurrentQuery(null);
    });
  };

  /* Listens for new queries in firebase and updates local state. Also fills local state on first load with user's queries */
  addNewQueryListener = () => {
    const { currentUser, queriesRef } = this.state;
    queriesRef.child(currentUser.uid).on("child_added", snap => {
      const loadedQueries = this.state.queries;
      loadedQueries.push(snap.val());
      this.setState({ queries: loadedQueries }, () => {
        loadedQueries.length == 1 && this.setFirstQuery(loadedQueries); // --> if this is the first time
      });
    });
  };

  /* Maps through user's queries and displays list */
  displayQueries = queries =>
    queries.length > 0 &&
    queries.map(query => {
      return (
        <div
          key={query.id}
          className={
            query.id === this.state.activeQuery
              ? "query__item active__item"
              : "query__item"
          }
          onClick={() => this.changeCurrentQuery(query)}
          style={{ cursor: "pointer", textDecoration: "none", color: "#FFF" }}
        >
          <div className="query__item__overlay"></div># {query.name}{" "}
          <span id="results__count">
            ({query.results ? query.results.length : 0})
          </span>
        </div>
      );
    });

  /* Used to switch queries and update global and local state */
  changeCurrentQuery = async nextQuery => {
    this.setActiveQuery(nextQuery);
    await this.props.setCurrentQuery(nextQuery);
    if (this.props.sidePanelOpen) this.props.toggleSidePanel();
  };

  /* used to show active query highlighting */
  setActiveQuery = query => {
    this.setState({ activeQuery: query.id });
  };

  /* called on first query load */
  setFirstQuery = queries => {
    queries.length > 0
      ? this.changeCurrentQuery(queries[0])
      : this.props.setCurrentQuery(null);
    this.addRemovedQueryListener();
  };

  render() {
    return (
      <React.Fragment>
        <div className="sidePanel__menu main__sidepanel__colors">
          <h3 className="main__sidepanel__colors">
            <span>
              <Icon name="exchange" />
              Queries
            </span>{" "}
          </h3>
          {this.state.queries.length > 0 &&
            this.displayQueries(this.state.queries)}
        </div>
      </React.Fragment>
    );
  }
}

export default connect(null, { setCurrentQuery, toggleSidePanel })(
  CurrentQueries
);
