<h1>Floye's 餐酒館</h1>
    <p>目標功能</p>
    <ul>
        <li>使用EJS模板渲染動態網頁內容(變數取得於資料庫)</li>
        <li>會員註冊、登入 ( Google Firebase Authentication )</li>
        <li>新增、修改、刪除購物頁面產品（需身份驗證）</li>
        <li>使用 middleware 驗證使用者身份</li>
    </ul>
    <br>
    <h3>頁面呈現、動態取得變數</h3>
    <p>
        於前端按鈕中埋入不同路徑，當使用者造訪時，處理此頁面的內容便寫在對應路由中，包含取得網頁上變數及要渲染的產品資料、渲染模版等。
    </p>

```        
// 處理購物頁面相關內容
app.get('./shop', async function(req, res){...})   

//登入頁面
app.get('./login', async (req, res) => {...})

// 登入
app.post('./api/login', (req, res) => {...})
```

<p>有些資料要從資料庫取得後再傳遞到模板上：</p>
        
```        
let variables = async () => {
  let variables = {};
  const layoutDoc = await db.doc('content/layout').get(); // 取得資料庫中的內容
  
  // 整理變數名稱
  variables.title = layoutDoc.data().title;
  ...
  
  return variables;
};

module.exports = variables; 
```
        
<br>
<br>
<h3>會員註冊、登入</h3>
<p>
在前端可以直接和Firebase對接以驗證帳號密碼，如果驗證正確則會取得 idToken，將其傳送到後端。
<br>
如果是新用戶要註冊，取得使用者填寫的資料後，在前端呼叫 Firebase-Auth 的 createUserWithEmailAndPassword() 並帶入資料即可。
</p>
        
```
// 前端驗證帳號密碼
firebase
.auth()
.signInWithEmailAndPassword(account.email, account.password)
.then(function (res) {
  console.log(`[登入成功]`, res);
  res.user.getIdToken()
  .then(idToken => {
     axios.post('/api/login', { idToken: idToken })
        .then(res => {
           console.log(`[成功]`, res);
           alert(`登入成功，即將為您跳轉頁面。`);
           window.location = '/';
          })
        .catch(err => {
          console.log('[錯誤]', err);
            })
          });
        })
   .catch(function (err) {
     console.log(`[登入失敗]`, err);
     }
   )
 ```
         
<br>
<p>後端接收到前端傳遞的 idToken，會向 Firebase-Auth 換取 Session Cookie，設定 available duration 後，設置 cookie 到使用者瀏覽器即可。</p>
        
```
// 後端登入流程
app.post('./api/login', (req, res) => {
  const idToken = req.body.idToken;
  const sessionKey = req.app.locals.sessionKey; // 設定全域變數
  const expiresIn = 60 * 60 * 24 * 5 * 1000;
  admin.auth().createSessionCookie(idToken, { expiresIn })
    .then(sessionCookie => {
      const options = {
        maxAge: expiresIn,
        httpOnly: true // 這個cookie只能由server儲存，一般前端無法竄改。
      };
      res.cookie(sessionKey, sessionCookie, options)
      res.status(200).json({
        msg: 'Login Success!'
      })
    })
  })
})
```
        
<br>
<br>
<h3>從 Database 取得、修改、刪除資料</h3>
<p>
Firebase 的資料庫在操作上很直覺，取得商品的方式就和上面取得變數的方式一樣，只是這裡要注意除了商品的基本資訊外，也要把資料庫中的 ID 帶到商品資料裡，之後才能藉由它辨認要修改、刪除的產品為何者。
</p>
<br>
<p>
在購物頁面的模板上要下判斷式，如果對方是網站管理者、擁有新增、修改、刪除商品等權限，就可以進入管理商品的相關頁面，此時 href 帶的參數會是變數如 "/product/edit/<%= product.id %>"，點擊後後端相關路由會取得模板中傳遞的 ID 變數，藉此辨認資料庫中被選取的商品。
</p>
<br>
<p>
詳細可見 app.js 檔案中管理商品相關的 router 程式碼。
</p>
<br>
<br>
<h3>Middleware</h3>
<p>
由於有製作與權限相關的（編輯產品等）、以及和會員資格有關的功能，有些頁面是不能讓管理者以外的人進入的，如果訪客想試圖進入新增產品頁面（在瀏覽器中打出正確網址），middleware守衛會去驗證此人身份，發現他不是管理者就會把瀏覽器導回首頁。
</p>
        
```
function adminGuard(router) {
    router.use(async (req, res, next) => {
        if (res.locals.auth.isAdmin) {
            next();
        } else {
            res.redirect('/');
        }
    })
}
```
        
