'use strict'
const PORT = 8080

const bodyParser = require('body-parser')
const request = require('request-promise')
const express = require('express')
const server = express()
const router = express.Router()
const sha1 = require('sha1');
server.use('/', router)

function getRendererModel(req, res) {
    const url = req.body.url
    if (!url) {
        res.status(500).send({error: 'could not retrieve url'})
        return
    }

    const hash =

    request(url)
        .then(function (error, response, body) {
            if (!error && response && response.statusCode === 200) {
                const regex = new RegExp(/var rendererModel = {.*}/g)
                const arr = body.match(regex)
                const found = !!(arr && arr[0])
                if (!found) {
                    res.status(500).send({error: 'rendererModel not found'})
                    return
                }

                const model = (function (js) {
                    const rendererModel = null
                    eval(js)
                    return rendererModel
                })(arr[0])

                res.send(model)
            } else {
                res.status(response.statusCode).send(error)
            }
        })
}

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended: true}))
// router.use('/', express.static(__dirname + '/../client/'))
router.use('/getRendererModel', getRendererModel)

server.listen(PORT)

