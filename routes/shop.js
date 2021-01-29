const express = require('express');
const router = express.Router();
const db = require('../db');
const loginChecker = require('../middleware/login-checker');
const variables = require('../middleware/variables')

// 設置登入檢查站
loginChecker(router);

router.get('/shop', async function (req, res, next) {
    const vars = await variables();
    res.locals.vars = vars;

    const shopDoc = await db.doc('content/shop').get();
    res.locals.category1 = shopDoc.data().category1;
    res.locals.category2 = shopDoc.data().category2;
    res.locals.category3 = shopDoc.data().category3;

    const productDocs = await db.collection('products').orderBy('name').get(); // productDocs僅為類陣列

    // 建立產品清單
    const products = [];
    productDocs.forEach(doc => {
        const product = doc.data();
        product.id = doc.id;
        products.push(product);
    });
    res.locals.products = products;

    res.render("shop");
});

module.exports = router;