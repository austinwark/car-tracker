require('./utils/scraper')();
require('./utils/mailer')();
const express = require('express');
const app = express();
const path = require('path');
const port = process.env.PORT || 5000;

const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// for web scraping api call
app.post('/api/scrape', async (req, res) => {
	console.log("SERVER: ", req.body)
    const { model, price, operator } = req.body;
    
    const data = await Scraper(model, price, operator);
    if (data) {
        res.status(200).send({ arr: data });
    } else {
        res.status(400).send("Error");
    }


    }

)

// for email send api
app.post('/api/mailer', async (req, res) => {
    const { results } = req.body;
    const success = await sendToMail(results);
    if (success) 
        res.status(200).send();
    else
        res.status(400).send();
})


//Static file declaration
app.use(express.static(path.join(__dirname, 'client/build')));

//production mode
if(process.env.NODE_ENV === 'production') {
	app.use(express.static(path.join(__dirname, 'client/build')));
	app.get('*', (req, res) => {
		res.sendfile(path.join(__dirname = 'client/build/index.html'));  
	})
}

//build mode
app.get('*', (req, res) => {  res.sendFile(path.join(__dirname+'/client/public/index.html'));})

app.listen(port, (req, res) => {  console.log( `server listening on port: ${port}`);})