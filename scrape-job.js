// import firebase from './client/src/firebase';
require('./utils/scraper')();
const firebase = require('./client/src/firebase')


async function getData() {
    const usersRef = firebase.database().ref('users');
    const model = "Corolla";
    const price = 22000;
    const operator = "less";
    
    
    usersRef.once('value').then(async snap => {
        const userIds = Object.keys(snap.val())
        await getQueries(userIds);
    })
}

async function getQueries(users) {
    const queriesRef = firebase.database().ref('queries');
    
    users.forEach(user => {
        queriesRef.child(user).once('value').then(async snap => {
            if (snap.val()) {
                const userQueries =  Object.entries(snap.val())
                
                let queryArray = [];
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

async function getScrapeResults(userId, queries) {
    const queriesRef = firebase.database().ref('queries');
    
    queries.forEach(async query => {
        const queryId = Object.keys(query)[0];
        const queryDetails = Object.values(query)[0]

        const model = queryDetails.model;
        const price = queryDetails.price;
        const operator = queryDetails.operator;
        const data = await Scraper(model, price, operator);
        const results = { arr: data };
        let newQuery = queryDetails;
        newQuery.results = results;
        newQuery.prevResults = queryDetails.results;

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

getData();