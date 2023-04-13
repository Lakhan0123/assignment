const pup = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await pup.launch()
    const page = await browser.newPage()

    await page.goto('https://en.wikipedia.org/wiki/List_of_countries_by_GDP_(nominal)', {
        waitUntil: 'networkidle2'
    })

    // await page.screenshot({path: 'mangoWiki.png'})

    await page.waitForSelector('table.wikitable')

    const content = await page.evaluate(async () => {
        let countrydata = [];
        let countriesNode = document.querySelectorAll('td .flagicon ~ a[href*="/wiki/"]')
        countriesNode.forEach((el) => {
            countrydata.push({
                countryName: el.innerText,
                url: el.href
            })
        })
        return countrydata;
    })

    console.log(content)
    //
    let finalData = []
    for (object of content) {
        await page.goto(object.url, { waitUntil: 'load' })
        let eachCountryData = await page.evaluate(async (obj) => {
            let requiredInfo = {};
            requiredInfo.country = obj.countryName;
            requiredInfo.wikipedia_page = obj.url;
            let statistic = getElementsByXPath(`//table[@class="infobox"]//th[contains(text(),"Statistics")]`)
            if (statistic) {
                let exportEls = getElementsByXPath(`//th//div[contains(text(),'Main export partner')]//parent::th/following-sibling::td//a[@title]`)
                let importEls = getElementsByXPath(`//th//div[contains(text(),'Main import partner')]//parent::th/following-sibling::td//a[@title]`)
                let exportPartner = [];
                let importPartner = [];
                for (partner of exportEls) {
                    exportPartner.push(partner.innerText ? partner.innerText : '')
                }
                for (partner of importEls) {
                    importPartner.push(partner.innerText ? partner.innerText : '')
                }
                requiredInfo.export_partners = exportPartner.join(',');
                requiredInfo.import_partners = importPartner.join(',');
            } else {
                requiredInfo.import_partners = ''
                requiredInfo.export_partners = ''
            }
            return requiredInfo
            function getElementsByXPath(xpath, parent) {
                let results = [];
                let query = document.evaluate(xpath, parent || document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null); for (let i = 0, length = query.snapshotLength; i < length; ++i) {
                    results.push(query.snapshotItem(i));
                } return results;
            }
        }, object)
        finalData.push(eachCountryData)
        console.log(finalData)
    }
    // creating csv file
     function jsonToCsv(items) {
        const header = Object.keys(items[0]);

        const headerString = header.join(',');

        // handle null or undefined values here
        const replacer = (key, value) => value ?? '';

        const rowItems = items.map((row) =>
            header
                .map((fieldName) => JSON.stringify(row[fieldName], replacer))
                .join(',')
        );

        // join header and body, and break into separate lines
        const csv = [headerString, ...rowItems].join('\r\n');
        
        return csv;
    }
    
    const csv = await jsonToCsv(finalData);
    console.log(csv);
    try {
        fs.appendFileSync("./export_import.csv", csv);
    } catch (err) {
        console.error(err);
    }
    console.log("stored csv file successfully")
    //
    await browser.close()
})();