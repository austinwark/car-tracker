require('./utils/scraper')();
const express = require('express');
const bodyParser = require('body-parser');


const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/api/scrape', async (req, res) => {
    
    const data = await Scraper("corolla", 10000, "greater");
    if (data) {
        res.status(200).send({ arr: data });
    } else {
        res.status(400).send("Error");
    }


    }

)

app.listen(port, () => console.log('listening'));