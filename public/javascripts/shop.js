window.onload = (function () {

    // 購物車清單-點擊
    const productList = document.querySelector(`.product-lists`);
    const cartIcon = document.querySelector(`.cart-icon`); // 購物車icon
    const closeCartListBtn = document.querySelector(`.close-cart-list`);
    const topBar = document.querySelector(`.top-bar`);
    const cartTable = document.querySelector(`.cart-list-table`);

    cartIcon.addEventListener(`click`, toggleCartList); // 展開 cart-list
    closeCartListBtn.addEventListener(`click`, toggleCartList); // 收起 cart-list

    function toggleCartList(e) {
        e.preventDefault();
        topBar.classList.toggle(`show-cart-list`);
    }

    // 加入喜愛清單
    productList.addEventListener(`click`, likeIconToggle);
    function likeIconToggle(e) {
        if (e.target.nodeName === "I") {
            const clickedItem = e.target;
            if (clickedItem.id === "") {
                clickedItem.id = "product-like-icon-clicked";
            } else {
                clickedItem.id = "";
            }
        } else {
            return;
        }

    }
})();