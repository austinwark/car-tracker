require("./utils/scraper")();
require("./utils/mailer")();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const port = process.env.PORT || 5000;
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/* Endpoint called to retrieve data through web scraping */
app.post("/api/scrape", async (req, res) => {
  const { model, price, minYear, maxYear, operator, allStores } = req.body; // uses search parameters passed on body of request
  const data = await Scraper(
    model,
    price,
    minYear,
    maxYear,
    operator,
    allStores
  );
  if (data) {
    res.status(200).send({ arr: data });
  } else {
    res.status(400).send("Error");
  }
});

/* Endpoint called for sending query results to user's email address */
app.post("/api/mailer", async (req, res) => {
  const { results, email } = req.body; // uses email address parameter passed on request body
  const success = await sendToMail(results, email);
  if (success) res.status(200).send();
  else res.status(400).send();
});

//Static file declaration
app.use(express.static(path.join(__dirname, "client/build")));

//production mode
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/build")));
  app.get("*", (req, res) => {
    res.sendfile(path.join((__dirname = "client/build/index.html")));
  });
}

//build mode
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/public/index.html"));
});

app.listen(port, (req, res) => {
  console.log(`server listening on port: ${port}`);
});
