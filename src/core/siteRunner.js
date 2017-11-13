const puppeteer = require('puppeteer')
const _ = require('lodash')
const sha1 = require('sha1')
const sites = require('../tests/sites')
const fs = require('fs')

async function openSite(sitesResources, siteUrl, targetDir) {
    const browser = await puppeteer.launch({headless: false})
    const page = await browser.newPage()
    debugger
    await page.setRequestInterceptionEnabled(true);

    page.on('request', request => {
        const url = request.url
        const hash = sha1(url)
        debugger
        if (!sitesResources[hash]) {
            request.continue()
            console.log(`url- ${url} not scraped`)
            return
        }

        const body = fs.readFileSync(`${targetDir}/${hash}`)
        const contentType = sitesResources[hash].contentType
        request.respond({
            body,
            contentType
        })

        console.log(url)
    });

    await page.goto(siteUrl)
    await browser.close()
}

async function openSites(sitesResources, santaVersion, targetDir) {
    // await Promise.all(_.map(sites, (url) => scrapeSite(sitesResources, `${url}?ReactSource=${latestArtifactVersion}`)))
    // await Promise.all(_.map(sitesResources, (resourceData, hash) => fetcher.downloadFile(resourceData.url, `${targetDir}/${hash}`)))
    // return sitesResources
    
    await openSite(sitesResources, `${sites.empty}?ReactSource=${santaVersion}`, targetDir)
}

module.exports = {
    openSites
}