var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

const QRCode = require('qrcode');

router.get('/api/code.png', function(req, res, next) {
    return QRCode.toFileStream(res, 'data in code', {
        color: {
            dark: '#0000FF',  // Blue dots
            light: '#0000' // Transparent background
        }
    });
});

module.exports = router;
