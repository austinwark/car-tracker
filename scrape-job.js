// import firebase from './client/src/firebase';
require('./utils/scraper')();
const firebase = require('./client/src/firebase')
const moment = require('moment');

async function getUsers() {
    const usersRef = firebase.database().ref('users');
    
    // gets user ID's
    usersRef.once('value').then(async snap => {
        // const userIds = Object.keys(snap.val())

        const users = Object.entries(snap.val());
        const userIds = users.map(user => {
            const userId = user[0];
            const userDetails = user[1];
            const lastSignIn = userDetails.lastSignIn;
            const monthAgo = moment().subtract(30, 'days');
            const daysSince = moment(lastSignIn, "MM-DD-YYYY")
            if (!daysSince.isBefore(monthAgo)) {        // if user has signed in within last 30 days
                return userId;
            }
        })
        await getQueries(userIds);
    })
}

async function getQueries(users) {
    const queriesRef = firebase.database().ref('queries');
    
    // gets queries from each user
    users.forEach(user => {
        queriesRef.child(user).once('value').then(async snap => {
            if (snap.val()) {
                const userQueries =  Object.entries(snap.val())
                
                let queryArray = [];
                // destructures queries
                userQueries.forEach(userQuery => {
                    const queryId = userQuery[0];
                    const queryDetails = userQuery[1];
                    const queryObject = { [queryId]: queryDetails };
                    queryArray.push(queryObject) // creates an array of objects with queryId as key and details as value
                })
                let structuredUser = { [user]: queryArray } // creates an object with userId as key and queries array as value
                await getScrapeResults(user, queryArray)

            }
        })
    })
}

//gets results and updates firebase
async function getScrapeResults(userId, queries) {
    const queriesRef = firebase.database().ref('queries');
    
    queries.forEach(async query => {
        const queryId = Object.keys(query)[0];
        const queryDetails = Object.values(query)[0]
        const allStores = queryDetails.settings.allStores || false;

        const model = queryDetails.model;
        const price = queryDetails.price;
        const operator = queryDetails.operator;
        const { minYear, maxYear } = queryDetails;
        const data = await Scraper(model, price, minYear, maxYear, operator, allStores);
        // const results = data;
        console.log(data);

        

        let newQuery = queryDetails;
        // newQuery.prevResults = queryDetails.results;              
        newQuery.results = data;
        // console.log(newQuery)
        await queriesRef
            .child(userId)
                .child(queryId)
                    .set(newQuery)
                        .then(() => {
                            console.log('update successful');
                        })
                        .catch(err => {
                            console.error(err)
                        })
    })

}

getUsers();