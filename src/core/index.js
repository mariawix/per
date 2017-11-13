'use strict'

const fetcher = require('./fetcher')
const scraper = require('./scraper')
const siteRunner = require('./siteRunner')

const TARGET_DIR = './src/target'
const ARTIFACT_NAME = 'santa';

fetcher.getLatestUploadedSnapshotVersionByArtifactName(ARTIFACT_NAME, TARGET_DIR)
    .then(async (santaVersion) => {
        console.log(`${santaVersion} downloaded`)
        const sitesResources = await scraper.scrapeSites(santaVersion, TARGET_DIR)
        console.log('Sites scrapped')
        await siteRunner.openSites(sitesResources, santaVersion, TARGET_DIR)
        console.log('Tests finished successfully')
    })
