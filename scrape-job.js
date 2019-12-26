require("./utils/scraper")();
const firebase = require("./client/src/firebase");
const moment = require("moment");

/*
 * Utility job called daily to update firebase database with new query results
 */

/* Retrieves all the user IDs in database and calls the getQueries() function for each user */
async function getUsers() {
  const usersRef = firebase.database().ref("users");

  usersRef.once("value").then(async snap => { // 1) retrieves all users in database

    const users = Object.entries(snap.val());
    const userIds = users.map(user => { // 2) Iterates through user list
      const userId = user[0];
      const userDetails = user[1];
      const lastSignIn = userDetails.lastSignIn;
      const monthAgo = moment().subtract(30, "days");
      const daysSince = moment(lastSignIn, "MM-DD-YYYY");
      if (!daysSince.isBefore(monthAgo)) { // 3) Will only return user ID if user has been signed in within 30 days
        return userId;
      }
    });
    await getQueries(userIds); // 4) Get query results
  });
}

/* Retrieves query info for each user signed in within last 30 days and calls getScrapeResults() for each */
async function getQueries(users) {
  const queriesRef = firebase.database().ref("queries");

  users.forEach(user => { // 1) Iterates through list of user IDs
    queriesRef
      .child(user)
      .once("value") // 2) Retrieves saved queries for each user in firebase
      .then(async snap => {
        if (snap.val()) {
          const userQueries = Object.entries(snap.val()); // 3) Destructures results from firebase to get user's queries
          let queryArray = [];

          userQueries.forEach(userQuery => { // 4) Iterates through user's queries
            const queryId = userQuery[0];
            const queryDetails = userQuery[1];
            const queryObject = { [queryId]: queryDetails };
            queryArray.push(queryObject); // 5) creates an array of objects with the query ID as key and it's details as value
          });
          await getScrapeResults(user, queryArray); // 6) Gets new query results for each query
        }
      });
  });
}

/* Retrieves query results through web scraping for each user */
async function getScrapeResults(userId, queries) {
  const queriesRef = firebase.database().ref("queries");

  queries.forEach(async query => { // 1) Iterates through user's queries
    const queryId = Object.keys(query)[0];
    const queryDetails = Object.values(query)[0];

    const { model, price, operator, minYear, maxYear } = queryDetails; // 2) Destructures query parameters
    const allStores = queryDetails.settings.allStores || false;

    const data = await Scraper( // 3) Retrieves new results using utility function, passing query parameters
      model,
      price,
      minYear,
      maxYear,
      operator,
      allStores
    );

    let newQuery = queryDetails;
    newQuery.results = data; // 4) Attaches new results to query
    await queriesRef // 5) Updates query in database w/ new results
      .child(userId)
      .child(queryId)
      .set(newQuery)
      .catch(err => {
        console.error(err);
      });
  });
}

getUsers();
