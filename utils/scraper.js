const axios = require("axios");
const cheerio = require("cheerio");

/* Utility function used to scrape Lia Toyota's website for vehicle data */
module.exports = function() {
    
  this.Scraper = async function( // 1) Takes the desired model, price (lesser or greater), min and max year, and search all stores settings
    model,
    price,
    minYear,
    maxYear,
    operator,
    allStores
  ) {
    model = model.charAt(0).toUpperCase() + model.substring(1);

    let totalResults = []; // will contain final scraped results

    try {
      for (let i = 1; i < 2; i++) {
        const siteUrl = allStores // 2) Uses query string to narrow initial results by model and dealership, loops through multiple pages using variable i
          ? `https://www.liatoyotaofcolonie.com/searchused.aspx?Make=Toyota&Model=${model}&pt=${i}`
          : `https://www.liatoyotaofcolonie.com/searchused.aspx?Dealership=Lia%20Toyota%20of%20Colonie&Make=Toyota&Model=${model}&pt=${i}`;

        const pageData = await axios.get(siteUrl);
        const $ = cheerio.load(pageData.data);

        const sections = [];
        $("div[id*='srpVehicle']").each((i, el) => { // 3) Retrieves a section for each vehicle on the page, which contains most of the data needed
          if (Object.values($(el).data()).length > 0) {
            sections.push($(el).data());
          }
        });

        const stocks = [];
        $(".stockDisplay").each((i, el) => { // 4) Has to seperately grab stock numbers for each vehicle - not part of above section
          if (i % 2 === 0 || i === 0) {
            let stock = $(el)
              .text()
              .substring(8)
              .trim();
            stocks.push(stock);
          }
        });
        const miles = [];
        $(".mileageDisplay").each((i, el) => { // 5) Has to seperately grab miles for each vehicle
          if (i % 2 === 0 || i === 0) {
            let mile = $(el)
              .text()
              .substring(8)
              .trim();
            miles.push(mile);
          }
        });
        const dealers = [];
        $(".dealershipDisplay").each((i, el) => { // 6) Has to seperately grab dealership info for each vehicle
          if (i % 2 === 0 || i === 0) {
            let dealer = $(el)
              .text()
              .substring(11)
              .trim();
            dealers.push(dealer);
          }
        });
        const links = [];
        $(".vehicleDetailsLink").each((i, el) => { // 7) Has to seperately grab links to each vehicle's page
          let link = $(el).attr("href");
          links.push(link);
        });
        const carfaxLinks = [];
        $(".carhistory").each((i, el) => { // 8) Has to seperately grab car fax links for each vehicle         
          let carfax = $(el)
            .children("a")
            .first()
            .attr("href");
          carfaxLinks.push(carfax);
        });

        let vehicleData = [];

        vehicleData = sections.map((el, i) => { // 9) Iterates through the scraped sections, and structures desired data into a object         
          const newVehicle = {
            stock: stocks[i],
            make: el.make,
            model: el.model,
            year: el.year,
            trim: el.trim,
            extColor: el.extcolor,
            price: el.price,
            metadata: {
              vin: el.vin,
              intColor: el.intcolor,
              transmission: el.trans,
              engine: el.engine,
              miles: miles[i],
              dealer: dealers[i],
              link: links[i],
              carfaxLink: carfaxLinks[i]
            }
          };
          return newVehicle;
        });

        let modelsMatch = vehicleData.filter((item, index) => { // 10) Filters for only the desired model        
          return item.model.toLowerCase() === model.toLowerCase();
        });

        let yearsMatch = modelsMatch.filter(item => { // 11) Filters for only vehicles that match the desired min and max year         
          return item.year >= minYear && item.year <= maxYear;
        });

        let pricesMatch = [];

        if (operator == "less") { // 12) Filters for vehicle either above or below specified price
          pricesMatch = yearsMatch.filter(item => item.price < price);
        } else {
          pricesMatch = yearsMatch.filter(item => item.price > price);
        }

        pricesMatch.map(item => { // 13) Pushes final results into array to be returned on response body
          totalResults.push(item);
        });

      }
    } catch (error) {
      console.log(error);
    }
    return totalResults;
  };
};
