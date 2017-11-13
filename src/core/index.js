'use strict'

const fetcher = require('./fetcher')
const scraper = require('./scraper')

const TARGET_DIR = './src/target';
const ARTIFACT_NAME = 'santa'


async function openSite(name, url, TARGET_DIR) {
    const browser = await puppeteer.launch({headless: false})
    // const page = await browser.newPage()
    // await page.setRequestInterceptionEnabled(true)
    // page.on('request', request => {
    //     const hash = sha1(request.url)
    //     const body = fs.readFileSync(`./src/target/${hash}`)
    //     request.respond({body})
    // });
    //
    // await page.goto('https://mariao3.wixsite.com/empty-site?ReactSource=1.2591.0')
    await browser.close()
}

fetcher.getLatestSnapshotVersionByArtifactName(ARTIFACT_NAME)
    .then(async (latestArtifactVersion) => {
        // fetcher.downloadArtifact('santa', latestArtifactVersion, TARGET_DIR)
        await scraper.scrapeSites(latestArtifactVersion, TARGET_DIR)
        // await openSite('empty', `${sitesConf.empty}?ReactSource=${latestArtifactVersion}`, targetDir)
    })

// Download santa-version
// Download site with local santa-version
// With puppeteer open site with local santa-version