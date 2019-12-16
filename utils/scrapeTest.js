require('./scraper')();

async function test() {
    await Scraper("tacoma", 32000, "less", false)
}

test();