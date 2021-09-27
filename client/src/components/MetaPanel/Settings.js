import React from "react";
import axios from "axios";
import { connect } from "react-redux";
import {
  setCurrentNotification,
  clearCurrentNotification,
  setCurrentQuery
} from "../../actions";
import {
  Button,
  Confirm,
  Icon,
  Grid,
  Popup,
  Checkbox
} from "semantic-ui-react";
import Skeleton from "../ResultsPanel/Skeleton";
const firebase = require("../../firebase");

/* Settings component displayed in Metapanel, used to edit query settings and perform actions */
class Settings extends React.Component {
  state = {
    queriesRef: firebase.database().ref("queries"),
    isVerified: firebase.auth().currentUser.emailVerified,
    deleteLoading: false,
    emailLoading: false,
    open: false,
    autoEmails: true,
    onlyNew: true,
    allStores: false
    // autoEmails: this.props.currentQuery,
    // onlyNew: this.props.currentQuery,
    // allStores: this.props.currentQuery
  };

  /* Performs a shallow comparison of currentQuery in props, if not the same, updates local state with new values */
  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.currentQuery &&
      JSON.stringify(prevProps.currentQuery) !==
      JSON.stringify(this.props.currentQuery)
    ) {
      this.setState({
        autoEmails: this.props.currentQuery.settings.autoEmails,
        onlyNew: this.props.currentQuery.settings.onlyNew,
        allStores: this.props.currentQuery.settings.allStores
      });
    }
  }

  /* Deletes the currently selected query from the database */
  handleDelete = currentQuery => {
    const { queriesRef } = this.state;
    const { currentUser } = this.props;
    this.setState({ deleteLoading: true });
    queriesRef
      .child(currentUser.uid)
      .child(currentQuery.id)
      .remove()
      .then(() => {
        //this.setNextQuery(); // sets next query after delete
        this.setState({ deleteLoading: false, open: false });
      })
      .catch(err => {
        this.setState({ deleteLoading: false, open: false });
        console.error(err);
      });
  };

  /* Sends current query results to user's email using axios call to server -> which calls utility functions */
  handleSendToEmail = async () => {
    const { currentQuery, currentUser, currentNotification } = this.props;
    const { results } = currentQuery;

    this.setState({ emailLoading: true });
    const url = "/api/mailer";
    const payload = { results: results, email: currentUser.email };
    const response = await axios.post(url, payload);
    if (response.status === 200) {
      if (currentNotification) await this.props.clearCurrentNotification();
      this.props.setCurrentNotification("Email successfully sent!");
    } else {
      if (currentNotification) await this.props.clearCurrentNotification();
      this.props.setCurrentNotification("Email failed to be sent!");
    }
    this.setState({ emailLoading: false });
  };

  /* Used to toggle query settings using UI checkboxes. Updates query settings in database, global redux state, and local state */
  toggleQuerySettings = (event, titleProps) => {
    const { currentQuery, currentUser } = this.props;
    const settingName = titleProps.name;
    const currentValue = currentQuery.settings[settingName];
    this.state.queriesRef
      .child(currentUser.uid)
      .child(currentQuery.id)
      .child("settings")
      .update({
        [settingName]: !currentValue
      });
    const updatedQuery = currentQuery;
    updatedQuery.settings[settingName] = !currentValue;
    this.props.setCurrentQuery(updatedQuery);
    this.setState({ [settingName]: !currentValue });
  };

  render() {
    if (this.props.isLoading) {
      // returns loading skeleton if props are loading
      return <Skeleton />;
    } else if (!this.props.currentQuery) {
      return <p>Create a query to access settings</p>;
    } else {
      const { currentQuery, currentUser } = this.props;
      const { open } = this.state;

      return (
        <React.Fragment>
          <Grid>
            <Grid.Row>
              <Grid.Column>
                <label style={{ display: "block" }}>Automatic Emails</label>
                <Checkbox
                  onChange={this.toggleQuerySettings}
                  checked={this.state.autoEmails}
                  toggle
                  name="autoEmails"
                  disabled={currentUser.isAnonymous ? true : false}
                />
                <Popup
                  key={0}
                  position="top right"
                  content={
                    currentUser.isAnonymous
                      ? "Create an account to enable daily email updates "
                      : "Controls automatic daily email updates "
                  }
                  style={{ zIndex: 9999 }}
                  trigger={
                    <Icon
                      name="question circle outline"
                      size="large"
                      className="question__icon"
                    />
                  }
                />
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                <label style={{ display: "block" }}>
                  Send only new results
                </label>
                <Checkbox
                  onChange={this.toggleQuerySettings}
                  checked={this.state.onlyNew}
                  toggle
                  name="onlyNew"
                  disabled={
                    currentUser.isAnonymous
                      ? true
                      : this.state.autoEmails
                      ? false
                      : true
                  }
                />
                <Popup
                  content={
                    currentUser.isAnonymous
                      ? "Create an account to configure settings "
                      : "Send only unseen query results or all query results"
                  }
                  position="top right"
                  style={{ zIndex: 9999 }}
                  trigger={
                    <Icon
                      name="question circle outline"
                      size="large"
                      className="question__icon"
                    />
                  }
                />
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                <label style={{ display: "block" }}>Search all stores</label>
                <Checkbox
                  onChange={this.toggleQuerySettings}
                  checked={this.state.allStores}
                  toggle
                  name="allStores"
                  disabled={currentUser.isAnonymous ? true : false}
                />
                <Popup
                  content={
                    currentUser.isAnonymous
                      ? "Create an account to configure settings"
                      : "Search all Lia stores or just Lia Toyota of Colonie"
                  }
                  position="top right"
                  style={{ zIndex: 9999 }}
                  trigger={
                    <Icon
                      name="question circle outline"
                      size="large"
                      className="question__icon"
                    />
                  }
                />
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                <Button
                  className="settings__button secondary__button"
                  disabled={
                    !currentQuery.results ||
                    !this.state.isVerified ||
                    currentUser.isAnonymous
                  }
                  loading={this.state.emailLoading}
                  onClick={this.handleSendToEmail}
                >
                  Send to email
                </Button>
                <Popup
                  key={1}
                  position="top right"
                  content={
                    currentUser.isAnonymous
                      ? "Sends results to your saved email address, you must create an account and verify your email first!"
                      : currentUser.emailVerified
                      ? "Sends results to your saved email address"
                      : "Sends results to your saved email address, you must verify your email first!"
                  }
                  style={{ zIndex: 9999 }}
                  trigger={
                    <Icon
                      name="question circle outline"
                      size="large"
                      className="question__icon"
                    />
                  }
                />
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                <Button
                  className="settings__button secondary__button"
                  onClick={() => this.setState({ open: true })}
                  loading={this.state.deleteLoading}
                >
                  Delete
                </Button>
                <Popup
                  key={2}
                  position="top right"
                  content="Permanently deletes query, and all automatic email updates"
                  style={{ zIndex: 9999 }}
                  trigger={
                    <Icon
                      name="question circle outline"
                      size="large"
                      className="question__icon"
                    />
                  }
                />
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <Confirm
            size="tiny"
            open={open}
            content="Are you sure you want to delete?"
            onCancel={() => this.setState({ open: false })}
            onConfirm={() => this.handleDelete(currentQuery)}
            confirmButton="Delete"
            cancelButton="Cancel"
            className="confirm__modal"
          />
        </React.Fragment>
      );
    }
  }
}

const mapStateToProps = state => ({
  currentNotification: state.notification.currentNotification
});

export default connect(mapStateToProps, {
  setCurrentNotification,
  clearCurrentNotification,
  setCurrentQuery
})(Settings);
