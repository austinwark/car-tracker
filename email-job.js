const firebase = require('./client/src/firebase')
require('./utils/mailer')();

// gets all user IDs with verified emails
async function getUsers() {

    const usersRef = firebase.database().ref('users');
    usersRef.once('value').then(snap => {
        const userEntries = snap.val();
        const userIds = Object.keys(userEntries)
        
        const verifiedUsers = userIds.map(user => {
            const userDetails = userEntries[user];
            if (userDetails.emailVerified === true) {
                return { userId: user, email: userDetails.email }
            }
        })
        
        verifiedUsers.forEach(async user => {
            if (user)
                await getQueries(user);
        })
    })
}

async function getQueries(user) {
    const { userId, email } = user;
    const queriesRef = firebase.database().ref('queries');
    queriesRef.child(userId).once('value').then(snap => {
        if (snap.val()) {
            const queries = Object.values(snap.val())
            queries.forEach(async query => {
                const { results, id } = query;
                const sentResults = query.sentResults ? query.sentResults : [];
                const { autoEmails, onlyNew } = query.settings;
                if (autoEmails) {
                    if (!onlyNew) {
                        const unseenResults = await filterForNewResults(results, sentResults, userId, id);
                        if (unseenResults.length > 0) {
                            const success = await sendToMail(unseenResults, email);
                            success ? console.log('success') : console.log('failure')
                        }
                    } else {
                        await filterForNewResults(results, sentResults, userId, id);  // still updates sent results in firebase
                        const success = await sendToMail(results, email);
                        success ? console.log('success') : console.log('failure')
                    }
                }
            })
        }

    })
}

async function filterForNewResults(results, sentResults, userId, queryId) {
    const queriesRef = firebase.database().ref('queries');
    const sentResultsStocks = sentResults.map(result => String(result.stock));  // array of seen stock numbers
    // console.log(results)
    let unseenResults = [];
    /* adds all new* results to unseenResults array */
    results.map(result => {
        if (!sentResultsStocks.includes(result.stock)) {
            unseenResults.push(result);
        }
    })
    // console.log(results.length)
    // console.log(sentResults.length)
    const updatedSentResults = sentResults.concat(unseenResults);
    // console.log(updatedSentResults)
    await queriesRef.child(userId).child(queryId).child("sentResults").set(updatedSentResults);
    return unseenResults;
}


getUsers();