require('./utils/scraper')();



async function getData() {
    const model = "Corolla";
    const price = 22000;
    const operator = "less";

    const data = await Scraper(model, price, operator);
    console.log("data", data);

}

getData();