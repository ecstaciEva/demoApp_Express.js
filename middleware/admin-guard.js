// 驗證管理者閘門
function adminGuard(router) {
    router.use(async (req, res, next) => {
        if (res.locals.auth.isAdmin) {
            next();
        } else {
            res.redirect('/');
        }
    })
}

module.exports = adminGuard;