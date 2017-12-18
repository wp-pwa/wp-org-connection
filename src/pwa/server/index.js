const path = require('path');
const router = require('express').Router();

router.get('/go-back-to-wppwa.js', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'go-back-to-wppwa.js'));
});

module.exports = router;
