const puppeteer = require('puppeteer')
const _ = require('lodash')
const sha1 = require('sha1')
const sites = require('../tests/sites')
const fetcher = require('./fetcher')

function shouldScrapeUrl(url){
    // return !/^(?:https?:\/\/)?static\.parastorage\.com\/\w*\/santa\/[\d.]*\/packages-bin.*$/.test(url)
    return !/^data:/.test(url)
}

async function scrapeSite(sitesResources, url) {
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

    await page.goto(url)
    await browser.close()
}

async function scrapeSites(latestArtifactVersion, targetDir) {
    const sitesResources = {}
    await Promise.all(_.map(sites, (url) => scrapeSite(sitesResources, `${url}?ReactSource=${latestArtifactVersion}`)))
    await Promise.all(_.map(sitesResources, (resourceData, hash) => fetcher.downloadFile(resourceData.url, `${targetDir}/${hash}`)))
    return sitesResources
}

module.exports = {
    scrapeSites
}