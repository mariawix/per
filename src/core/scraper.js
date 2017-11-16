const puppeteer = require('puppeteer')
const _ = require('lodash')
const sha1 = require('sha1')
const sites = require('../tests/sites')
const fetcher = require('./fetcher')
const fs = require('fs')

const shouldScrapeUrl = (url) => !/^data:/.test(url)

function downloadSitePage(filename, response) {
    response.buffer()
        .then((buffer) => fs.writeFile(filename, buffer))
        .catch((err) => console.log(`Failed to save ${response.request.url}. ${err}\n`))
}

async function scrapeSite(sitesResources, siteUrl, targetDir) {
    const browser = await puppeteer.launch({headless: false})
    const page = await browser.newPage()

    page.on('response', response => {
        const request = response.request();
        const url = request.url
        const hash = sha1(url)
        if (shouldScrapeUrl(url) && !sitesResources[hash]) {
            const contentType = _.get(response.headers, ['content-type'])
            const headers = response.headers
            sitesResources[hash] = {url, headers, contentType}
            debugger
            if (/\/sites\//.test(url)) {
                downloadSitePage(`${targetDir}/${hash}`, response)
            }
        }
    })
    await page.goto(siteUrl, {waitUntil: 'networkidle0'})
    await browser.close()
}

async function scrapeSites(santaVersion, targetDir) {
    const sitesResources = {}
    await Promise.all(_.map(sites, (url) => scrapeSite(sitesResources, `${url}?ReactSource=${santaVersion}`, targetDir)))
    await Promise.all(_.map(sitesResources, (resourceData, hash) => {
        return fetcher.downloadFile(resourceData.url, targetDir, hash)
            .catch((err) => {
                delete sitesResources[hash]
                console.log(`${err}. Remove hash of ${resourceData.url.split('?')[0]}?... from the sites resources\n`)
            })
    }))
    return sitesResources
}

module.exports = {
    scrapeSites
}