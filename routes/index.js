const express = require('express');
const router = express.Router();
const db = require('../db');
const loginChecker = require('../middleware/login-checker');
const variables = require('../middleware/variables')

// 設立登入檢查站
loginChecker(router);

// '/'
router.get('/', async (req, res, next) => {
  const vars = await variables();
  res.locals.vars = vars;

  let indexVars = {};
  const indexDoc = await db.doc('content/index').get();
  indexVars.aboutMeImg = indexDoc.data().aboutMeImg;
  res.locals.indexVars = indexVars;

  res.render('index');
});

module.exports = router;