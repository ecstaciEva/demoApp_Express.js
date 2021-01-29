const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const db = require('./db');
const admin = require('./firebase');
const adminGuard = require('./middleware/admin-guard');
const variables = require('./middleware/variables');

const indexRouter = require('./routes/index');
const app = express();
app.locals.sessionKey = 'myWebsiteKey';

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);



/* ========== 我是 Router 分隔線 ========== */

/* 產品購物頁面 */

app.get('/shop', async function (req, res, next) {
  const vars = await variables();
  res.locals.vars = vars;

  const shopDoc = await db.doc('content/shop').get();
  res.locals.category1 = shopDoc.data().category1;
  res.locals.category2 = shopDoc.data().category2;
  res.locals.category3 = shopDoc.data().category3;

  const productDocs = await db.collection('products').orderBy('name').get();
  const products = [];
  productDocs.forEach(doc => {
    const product = doc.data();
    product.id = doc.id;
    products.push(product);
  });
  res.locals.products = products;

  res.render("shop");

});


/* 登入頁面 */
app.get('/login', async (req, res, next) => {
  const vars = await variables();
  res.locals.vars = vars;
  res.render("login");
})

// 登入
app.post('/api/login', (req, res, next) => {
  const idToken = req.body.idToken;
  const sessionKey = req.app.locals.sessionKey;
  const expiresIn = 60 * 60 * 24 * 5 * 1000;
  admin.auth().createSessionCookie(idToken, { expiresIn })
    .then(sessionCookie => {
      console.log(`[sessionCookie]`, sessionCookie);
      const options = {
        maxAge: expiresIn,
        httpOnly: true
      };

      res.cookie(sessionKey, sessionCookie, options)
      res.status(200).json({
        msg: '完成登入手續！'
      })
    })
})

// 登出
app.post('/api/logout', (req, res, next) => {

  const sessionKey = req.app.locals.sessionKey;
  const sessionCookie = req.cookies[sessionKey] || '';

  res.clearCookie(sessionKey);

  admin.auth().verifySessionCookie(sessionCookie)
    .then(user => {
      admin.auth().revokeRefreshTokens(user.sub);
      res.status(200).json({ msg: '已成功登出！' });
    })
    .catch(err => {
      res.status(200).json({ msg: '已登出！' });
    })
})

// 建立預約
app.post('/api/new-reserv', (req, res, next) => {
  const reservation = req.body;
  db
    .collection('reservations')
    .add(reservation)
    .then(response => {
      res.status(200).json({
        msg: '已成功建立預約',
        response: response
      })
    })
    .catch(err => {
      res.status(500).json({
        msg: '發生錯誤，請重試！',
        err: err
      })
    })

})

// 使用守衛確認使用者身份
adminGuard(app);

// 新增產品頁面
app.get('/product/create', async (req, res, next) => {
  const vars = await variables();
  res.locals.vars = vars;
  res.render("product-create");
})

// 編輯產品頁面
app.get('/product/edit/:pid', async (req, res, next) => {
  const vars = await variables();
  res.locals.vars = vars;

  // 取得路徑上的產品id
  const pid = req.params.pid;
  const doc = await db
    .collection('products')
    .doc(pid)
    .get();
  const product = doc.data();
  product.id = pid;
  res.locals.product = product;
  res.render('product-edit');
});

// 建立新產品
app.post('/api/new-product', (req, res, next) => {

  const product = req.body;
  db
    .collection('products')
    .add(product)
    .then(response => {
      res.status(200).json({
        msg: "新產品已成功建立！",
        response: response
      })
    })
    .catch(error => {
      res.status(500).json({
        msg: "出現錯誤，請重試！",
        response: error
      })

    })
})

// 編輯產品
app.put('/api/edit/:pid', function (req, res, next) {
  const pid = req.params.pid;
  const product = req.body;
  db
    .collection('products')
    .doc(pid)
    .update(product)
    .then(() => {
      res.status(200).json({ msg: "產品已成功更新！" })
    })
    .catch(err => {
      res.status(500).json({ err: err })
    });

})

// 刪除產品
app.delete('/api/delete/:pid', (req, res, next) => {
  const pid = req.params.pid;
  db
    .collection('products')
    .doc(pid)
    .delete()
    .then(res => {
      res.status(200).json({
        msg: '產品已被刪除！'
      })
    })
    .catch(err => {
      res.status(200).json({
        err: err
      })
    })
});

// 查看預約頁面
app.get('/reservation', async (req, res, next) => {
  const vars = await variables();
  res.locals.vars = vars;

  const reservationDocs = await db.collection('reservations').orderBy('date').get();

  let reservations = [];
  reservationDocs.forEach(doc => {
    const reserv = doc.data();
    reserv.id = doc.id;
    reservations.push(reserv);
  });
  res.locals.reservations = reservations;

  res.render('reservation');
})

// 編輯預約頁面
app.get('/reservation/edit/:rid', async (req, res, next) => {
  const vars = await variables();
  res.locals.vars = vars;

  const rid = req.params.rid;
  const doc = await db
    .collection('reservations')
    .doc(rid)
    .get();
  const reserv = doc.data();
  reserv.id = rid;
  res.locals.reservation = reserv;
  res.render('reserv-edit');
})

// 修改預約
app.put('/api/reserv-edit/:rid', (req, res, next) => {
  const editReserv = req.body;
  const rid = req.params.rid;
  db
    .collection('reservations')
    .doc(rid)
    .update(editReserv)
    .then(response => {
      res.status(200).json({
        msg: '預定更新成功！',
        res: response
      })
    })
    .catch(err => {
      res.status(500).json({
        msg: '發生錯誤，請稍候重試！',
        err: err
      });
    })
})

app.delete('/api/reserv-delete/:rid', (req, res, next) => {
  const rid = req.params.rid;
  db
    .collection('reservations')
    .doc(rid)
    .delete()
    .then(response => {
      res.status(200).json({
        msg: "刪除成功！",
        response: response
      })
    })
    .catch(err => {
      res.status(500).json({
        msg: '發生錯誤，請稍後重試！',
        err: err
      })
    })
})

/* ========== 我是 Router 分隔線 ========== */

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;