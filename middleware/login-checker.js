const admin = require('../firebase');
const db = require('../db');

// 設置登入驗證關口
function loginChecker(router) {
    router.use(async (req, res, next) => {
        const sessionKey = req.app.locals.sessionKey;

        const sessionCookie = req.cookies[sessionKey] || ''; // 如果沒有cookie則預設為空值。
        console.log(`[sessionKey]`, sessionKey);
        console.log(`[sessionCookie]`, sessionCookie);
        // 預設登入狀態
        const auth = {
            isLogin: false,
            isAdmin: false,
            user: {}
        };


        admin.auth().verifySessionCookie(sessionCookie, true) // true → 驗證是否有登出過，如果有的話則cookie作廢。
            .then(async (user) => {
                // 取得管理者文件
                const doc = await db.doc(`admins/${user.email}`).get();

                if (doc.exists) {
                    auth.isAdmin = true;
                };

                auth.isLogin = true;
                auth.user = user;
                res.locals.auth = auth;
                next();
            })
            .catch(err => {
                res.locals.auth = auth;
                next();
            })
    })
};

module.exports = loginChecker;