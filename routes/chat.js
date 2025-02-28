const express = require('express');
const router = express.Router();
var msg = require('../controller/MsgController');

router.get('/',msg.get_msg);

module.exports = router;
