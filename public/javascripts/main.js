window.onload = (function () {


    // 確認載具或視窗寬度，寬度<768時，feature文字內容減少為20字。
    adjustFeatureContext();
    window.addEventListener(`resize`, adjustFeatureContext);

    // 漢堡選單按鈕
    const header = document.querySelector(`header`);
    const menuSwitch = document.querySelector(`.menu-switch`);
    menuSwitch.addEventListener(`click`, showMenu);

    // 點擊menu滾動動畫效果
    const menu = document.querySelector(`.menu`);
    menu.addEventListener(`click`, scroll);


    function adjustFeatureContext() {

        let deviceWidth = window.innerWidth;
        let featureContexts = document.querySelectorAll(`.feature-context`);

        if (deviceWidth < 769) {
            for (let i = 0; i < featureContexts.length; i++) {
                featureContexts[i].innerText = `Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quae ab eligendi quaerat unde. Aspernatur
                pariatur vero similique iusto, odio itaque!`
            }
        } else {
            for (let i = 0; i < featureContexts.length; i++) {
                featureContexts[i].innerText = `Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto,
                dolorem incidunt. Corporis quos aspernatur illo, quam voluptate ipsam quas a architecto
                libero debitis nam mollitia fugiat dignissimos quis voluptatibus recusandae ea labore
                tenetur nostrum, magnam cum. Odit odio perferendis quo.`
            }
        };
    }

    function showMenu(e) {
        e.preventDefault();
        header.classList.toggle(`show-menu`);
    };

    // 滾動效果
    function scroll(e) {

        if (e.target.nodeName !== "A") { return; };

        let item = e.target.hash;

        // 確認目標元素在同一個頁面
        if (item === "#feature" || item === "#chef" || item === "#reservation") {
            e.preventDefault();
            let target = $(item).offset().top;
            let duration = 800;
            $("html, body").animate({
                scrollTop: target
            }, duration);
        }
    };

    // 登出
    $('#logoutBtn').click(e => {
        e.preventDefault();
        axios.post('/api/logout', {})
            .then(function (res) {
                alert(`登出成功，將跳轉回首頁！`);
                window.location = '/';
            })
            .catch(function (err) {
                alert(`登出失敗，請重試！`);
                console.log(err);
            })
    })
})();