const puppeteer = require('puppeteer')
const _ = require('lodash')
const sha1 = require('sha1')
const sites = require('../tests/sites')
const fetcher = require('./fetcher')

const shouldScrapeUrl = (url) => !/^data:/.test(url)

async function scrapeSite(sitesResources, siteUrl) {
    const browser = await puppeteer.launch({headless: false})
    const page = await browser.newPage()

    page.on('response', response => {
        const request = response.request();
        const url = request.url
        const hash = sha1(url)
        if (shouldScrapeUrl(url) && !sitesResources[hash]) {
            const contentType = response.headers['content-type']
            sitesResources[hash] = {url, contentType}
        }
    });

    await page.goto(siteUrl)
    await browser.close()
}

async function scrapeSites(santaVersion, targetDir) {
    const sitesResources = {}
    await Promise.all(_.map(sites, (url) => scrapeSite(sitesResources, `${url}?ReactSource=${santaVersion}`)))
    console.log('sitesResources built')
    await Promise.all(_.map(sitesResources, (resourceData, hash) => fetcher.downloadFile(resourceData.url, targetDir, hash)))
        .catch((err, url) => console.log(`Failed to load ${url}. Error: ${err}`))
    return sitesResources
}

module.exports = {
    scrapeSites
}