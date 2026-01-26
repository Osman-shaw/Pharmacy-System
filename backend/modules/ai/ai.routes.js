const express = require('express');
const router = express.Router();
const multer = require('multer');
const aiController = require('./ai.controller');
const { auth } = require('../../middleware/auth.middleware');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/transcribe', auth, upload.single('audio'), aiController.transcribeKrio);

module.exports = router;
