const puppeteer = require('puppeteer')
const _ = require('lodash')
const sha1 = require('sha1')
const sites = require('../tests/sites')
const fs = require('fs')

async function openSite(sitesResources, siteUrl, targetDir) {
    const browser = await puppeteer.launch({headless: false})
    const page = await browser.newPage()
    await page.setRequestInterception(true);

    page.on('request', request => {
        const url = request.url
        const hash = sha1(url)
        const defaultContentType = (request.headers.accept || '').split(';')[0] || 'text/plain'
        if (!sitesResources[hash]) {
            console.log(`Not scrapped url detected ${url.split('?')[0]}?...`)
            console.log('Return empty successful response')
            request.respond({body: '', contentType: defaultContentType})
            return
        }
        const contentType = sitesResources[hash].contentType
        let headers = sitesResources[hash].headers

        let body = fs.readFileSync(`${targetDir}/${hash}`)
        const response = {contentType, headers, body}
        request.respond(response)
    })
    debugger
    await page.goto(siteUrl)
    setTimeout(async function() {
        await browser.close()
    }, 800000)

}

async function openSites(sitesResources, santaVersion, targetDir) {
    // await Promise.all(_.map(sites, (url) => scrapeSite(sitesResources, `${url}?ReactSource=${latestArtifactVersion}`)))
    // await Promise.all(_.map(sitesResources, (resourceData, hash) => fetcher.downloadFile(resourceData.url, `${targetDir}/${hash}`)))
    // return sitesResources

    await openSite(sitesResources, `${sites.empty2}?ReactSource=${santaVersion}`, targetDir)
        .catch((err) => {
            console.log(err)
        })
}

module.exports = {
    openSites
}