/*eslint semi:[2, "never"],strict: [2, "global"],comma-dangle:0,no-console:0,no-unused-vars:0*/
/*eslint-env node, es6 */
'use strict'
const _ = require('lodash')
const path = require('path')
const fs = require('fs')
const exec = require('shelljs').exec

/**
 * @param {boolean} verbose
 * @param msg
 * @private
 */
function _verbose(verbose, msg) {
    if (verbose) {
        console.log(msg)
    }
}

/**
 * @param {string} url
 * @param {string} file
 * @param {boolean} verbose
 */
function downloadFile(url, file, verbose) {
    if (fs.existsSync(file)) {
        _verbose(verbose, `Skipping ${file}`)
        return
    }
    mkdirp(path.dirname(file))
    const c = exec(`curl ${url} > ${file}`, {silent: true})
    if (c.code !== 0) {
        console.log('downloadFile', c.code, c.stdout)
    }
    _verbose(verbose, `Downloading ${url}`)
}

/**
 * @param {string} file
 */
function mkdirp(file) {
    const c = exec(`mkdir -p ${file}`, {silent: true})
    if (c.code !== 0) {
        console.log('mkdirp', c.code, c.stdout)
    }
}

module.exports = downloadFile