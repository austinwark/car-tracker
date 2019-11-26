const firebase = require('./client/src/firebase')
require('./utils/mailer')();


async function getUsers() {

    const usersRef = firebase.database().ref('users');
    usersRef.once('value').then(snap => {
        const userEntries = snap.val();
        const userIds = Object.keys(userEntries)
        
        const verifiedUsers = userIds.map(user => {
            const userDetails = userEntries[user];
            if (userDetails.emailVerified) {
                return { userId: user, email: userDetails.email }
            }
        })
        
        verifiedUsers.forEach(async user => {
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
                const results = query.results;
                const queryName = query.name;
                const success = await sendToMail(results, email);
                // console.log(email)
                success ? console.log('success') : console.log('failure')
            })
        }

    })
}




getUsers();