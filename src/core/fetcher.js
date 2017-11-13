'use strict'

const request = require('request-promise')
const parser = require('xml2json')
const wget = require('wget')

const BASE_SNAPSHOT_URL = 'http://repo.dev.wix/artifactory/libs-snapshots/com/wixpress/html-client'

function getLatestSnapshotVersionFromArtifactMaven(xml) {
    const json = parser.toJson(xml)
    const artifactMavenMetadata = JSON.parse(json)
    return artifactMavenMetadata.metadata.versioning.latest.split(('-'))[0]
}

function getSnapshotUrl(artifactName, xml) {
    const json = parser.toJson(xml)
    const snapshotVersionMetadata = JSON.parse(json)
    const versions = snapshotVersionMetadata.metadata.versioning.snapshotVersions.snapshotVersion
    const version = versions[versions.length - 1].value
    const snapshotVersion = `${version.split('-')[0]}-SNAPSHOT`
    return `${BASE_SNAPSHOT_URL}/${artifactName}/${snapshotVersion}/${artifactName}-${version}.tar.gz`
}

function downloadFile(url, targetPath) {
    return new Promise((resolve, reject) => {
        const download = wget.download(url, targetPath)
        download.on('error', reject)
        download.on('end', resolve)
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

function downloadArtifact(artifactName, snapshotVersion, targetDir) {
    const artifactSnapshotMetadataPath = `${BASE_SNAPSHOT_URL}/${artifactName}/${snapshotVersion}-SNAPSHOT/maven-metadata.xml`
    return new Promise((resolve, reject) => {
        request.get(artifactSnapshotMetadataPath)
            .then((body) => {
                const snapshotUrl = getSnapshotUrl(artifactName, body)
                const targetPath = `${targetDir}/${artifactName}-snapshot.tar.gz`
                return downloadFile(snapshotUrl, targetPath)
            })
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

module.exports = {
    getLatestSnapshotVersionByArtifactName,
    downloadFile,
    downloadArtifact
}
