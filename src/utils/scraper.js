const axios = require('axios')

const cheerio = require('cheerio')

/**
 * After stage one, will call Scraper() twice a day using cron jobs, updating a single source in database. Then 
 * there will be multiple filters that will be ran as needed by users to grab the data that is needed for that 
 * users queries. This will be a much more efficient way instead of making queries all day long for each user.
 * It's gonna be a single source of truth baby!
 */


module.exports = function() {
    this.Scraper = async function(model, price, operator) {

        model = model.charAt(0).toUpperCase() + model.substring(1)
    
        let totalResults = []
    
        try {
            for (let i=1;i < 5;i++) {
                //console.log(model)
                //const siteUrl = "https://www.liatoyotaofcolonie.com/searchused.aspx?Dealership=Lia%20Toyota%20of%20Colonie&Make=Toyota&pt=" + i;
                const siteUrl = `https://www.liatoyotaofcolonie.com/searchused.aspx?Dealership=Lia%20Toyota%20of%20Colonie&Make=Toyota&Model=${model}&pt=${i}`
                
                const pageData = await axios.get(siteUrl);
                const $ = cheerio.load(pageData.data);
    
                const sections = []
                $("div[id*='srpVehicle']").each((i, el) => {
                    if (Object.values($(el).data()).length > 0) {
                        sections.push($(el).data())
                        // console.log(sections.length)
                    }
                })
    
                //console.log(sections[0])
    
                const stocks = []
                $('.stockDisplay').each((i, el) => {
                    if (i % 2 === 0 || i === 0) {
                        let stock = $(el).text().substring(8).trim();
                        stocks.push(stock)
    
                    }
                })
                    
                let vehicleData = []
    
                vehicleData = sections.map((el, i) => {
                    const newVehicle = {
                        vin: el.vin,
                        stock: stocks[i],
                        make: el.make,
                        model: el.model,
                        year: el.year,
                        trim: el.trim,
                        extColor: el.extcolor,
                        price: el.price,
                    }
    
                    return newVehicle;
                })
    
                //console.log(vehicleData)
    
                let modelsMatch = vehicleData.filter((item, index) => {
                    return item.model.toLowerCase() === model.toLowerCase()
                })
                //console.log('------------------')
                //console.log(modelsMatch.length)
                //console.log(model)
    
                let pricesMatch = []
    
    
                if (operator == 'less') {
                    pricesMatch = modelsMatch.filter((item) => item.price < price)
                } else {
                    pricesMatch = modelsMatch.filter((item) => item.price > price)
                }
    
                    
    
                //console.log(pricesMatch.length)
                // console.log(operator)
                //console.log("Prices match: " + pricesMatch)
                pricesMatch.map(item => {
                    totalResults.push(item)
                })
    
            }
        } catch (error) {
            console.log("Page scraping done")
        }
        return totalResults;
    }
}