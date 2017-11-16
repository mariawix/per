'use strict'

const request = require('request-promise')
const parser = require('xml2json')
const download = require('download-file')
const _ = require('lodash')
const fs = require('fs')

const BASE_SNAPSHOT_URL = 'http://repo.dev.wix/artifactory/libs-snapshots/com/wixpress/html-client'

function getLatestSnapshotVersionFromArtifactMaven(xml) {
    const json = parser.toJson(xml)
    const artifactMavenMetadata = JSON.parse(json)
    return artifactMavenMetadata.metadata.versioning.latest.split(('-'))[0]
}

function downloadFile(url, targetDir, filename) {
    return new Promise((resolve, reject) => {
        const dest = `${targetDir}/${filename}`
        if (fs.existsSync(dest)) {
            console.log(`File ${dest} already exists\n`)
            resolve()
            return
        }
        const options = {directory: targetDir, filename}
        // download(url, path.join(directory, filename), true)
        // resolve()
        download(url, options, function (err) {
            if (err) {
                console.log(`Failed to load ${url.split('?')[0]}?...`)
                reject(err, url)
                return
            }
            resolve()
        })
    })
}

function getArtifactMaven(artifactName) {
    const artifactMavenMetadataPath = `${BASE_SNAPSHOT_URL}/${artifactName}/maven-metadata.xml`
    return new Promise((resolve, reject) => {
        request
            .get(artifactMavenMetadataPath)
            .then(resolve)
            .catch(reject)
    })
}

function getLatestSnapshotVersionByArtifactName(artifactName) {
    return new Promise((resolve, reject) => {
        getArtifactMaven(artifactName)
            .then((artifactMaven) => resolve(getLatestSnapshotVersionFromArtifactMaven(artifactMaven)))
            .catch(reject)
    })
}

function getPreviousMinorVersion(version) {
    const entities = _.map(version.split('.'), _.toNumber)
    entities[1]--
    return entities.join('.')
}

async function getLatestUploadedSnapshotVersionByArtifactName(artifactName, targetDir) {
    let version = await getLatestSnapshotVersionByArtifactName(artifactName)
    let tries = 3, success = false
    while (tries > 0 && !success) {
        success = true
        await downloadFile(`https://static.parastorage.com/services/santa/${version}/app/main-r.min.js`, targetDir, version)
            .catch(() => {
                success = false
                tries--
                console.log(`Cannot download ${version}. Trying to download previous version\n`)
                version = getPreviousMinorVersion(version)
            })
        if (success) {
            return version
        }
    }

    console.error(`Failed to find uploaded version of ${artifactName}`)
}

module.exports = {
    getLatestUploadedSnapshotVersionByArtifactName,
    downloadFile
}
