const jobController = require('./job.controller')

const express = require('express')
const router = express.Router()

router.get('/', jobController.getAllJobs)


module.exports = router;