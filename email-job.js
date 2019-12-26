const firebase = require("./client/src/firebase");
require("./utils/mailer")();

/*
 * Utility job called daily to send query results to users via email
 */

/* Retrieves all users in database with verified email addresses */
async function getUsers() {
  const usersRef = firebase.database().ref("users");
  usersRef.once("value").then(snap => {
    // 1) Gets all users from database
    const userEntries = snap.val();
    const userIds = Object.keys(userEntries); // 2) Retrieves ID from each each

    const verifiedUsers = userIds.map(user => {
      // 3) Iterates through ID's and only saves the users with verified emails
      const userDetails = userEntries[user];
      if (userDetails.emailVerified === true) {
        return { userId: user, email: userDetails.email };
      }
    });

    verifiedUsers.forEach(async user => {
      // 4) Iterates through verified users and gets query results for each user
      if (user) await getQueries(user);
    });
  });
}

/* Retrieves user's queries and sends filtered* results via email */
async function getQueries(user) {
  const { userId, email } = user;
  const queriesRef = firebase.database().ref("queries");
  queriesRef
    .child(userId)
    .once("value")
    .then(snap => { // 1) Gets user's queries
      if (snap.val()) {
        const queries = Object.values(snap.val());
        queries.forEach(async query => { // 2) Iterates through user's queries
          const { results, id } = query;
          if (results.length > 0) {
            const sentResults = query.sentResults || [];
            const { autoEmails, onlyNew } = query.settings;
            if (autoEmails) { // 3) --if user set up automatic email updates
              if (onlyNew) { // 4) --if user specified to send only new (unseen) results
                const unseenResults = await filterForNewResults( // 5) uses helper function to filter for only new results
                  results,
                  sentResults,
                  userId,
                  id
                );
                if (unseenResults.length > 0) {
                  const success = await sendToMail(unseenResults, email); // 6) sends results via email using external function
                  success ? console.log("success") : console.log("failure");
                }
              } else { // 7) --else-if user specified for all results to be sent every time
                await filterForNewResults(results, sentResults, userId, id); // 7) still filters for unseen results in order to keep track in database
                const success = await sendToMail(results, email); // 8) sends all results via email using external function
                success ? console.log("success") : console.log("failure");
              }
            }
          }
        });
      }
    });
}

/* Helper function used to filter for unseen results and update database accordingly */
async function filterForNewResults(results, sentResults, userId, queryId) {
  const queriesRef = firebase.database().ref("queries");
  const sentResultsStocks = sentResults.map(result => String(result.stock)); // 1) Destructures sent results into array of stock numbers for filtering
  let unseenResults = [];

  results.map(result => { // 2) Iterates through results and filters for unseen results
    if (!sentResultsStocks.includes(result.stock)) {
      unseenResults.push(result);
    }
  });
  const updatedSentResults = sentResults.concat(unseenResults);
  await queriesRef
    .child(userId)
    .child(queryId)
    .child("sentResults")
    .set(updatedSentResults); // 3) Updates sentResults field in query collection in database
  return unseenResults;
}

getUsers();
