function Cart() {

    const storageKey = 'dataStorage';
    let dataList = [];
    if (localStorage.getItem(storageKey)) {
        dataList = JSON.parse(localStorage.getItem(storageKey));
    };
    localStorage.setItem(storageKey, JSON.stringify(dataList));
    render(dataList);

    // 加入購物車-點擊按鈕
    $('#productList').click(e => {
        if (e.target.nodeName === "BUTTON" && e.target.id === "addToCartBtn") {

            const pid = e.target.dataset.pid; // firebase中的產品id(亂碼) → 用以取得selected num
            let nameList = [];
            dataList.forEach(data => {
                nameList.push(data.name);
            });
            const index = nameList.indexOf(e.target.dataset.name);

            if (index !== -1) {
                const addNum = parseInt($(`#${pid}Select`).val()); // 取得數量
                dataList[index].number += addNum;
                localStorage.setItem(storageKey, JSON.stringify(dataList));
                render(dataList);
            } else {
                // 新增物件
                const addToCartProduct = {
                    name: e.target.dataset.name,
                    price: parseInt(e.target.dataset.price),
                    number: parseInt($(`#${pid}Select`).val())
                };

                dataList.push(addToCartProduct);
                localStorage.setItem(storageKey, JSON.stringify(dataList));
                render(dataList);
            };
        } else {
            return;
        };
    })


    // 刪除一筆購物車資料
    $('.cart-list-table').click(e => {
        if (e.target.id === "deleteItemBtn") {
            const index = e.target.dataset.index;
            dataList.splice(index, 1);
            localStorage.setItem(storageKey, JSON.stringify(dataList));
            render(dataList);
        } else { return; };
    });

    function render(dataList) {
        let itemNum = dataList.length;
        document.getElementById('incartNum').innerText = itemNum; // 購物車數量提示
        let str =
            `<tr>
            <th>商品名稱</th>
            <th>價格</th>
            <th>數量</th>
            </tr>`;

        dataList.forEach((p, index) => {
            str +=
                `
            <td class="cart-list-name"><span  class="delete-item-btn">
            <i class="fas fa-trash" data-index="${index}" id="deleteItemBtn"></i></span> ${p.name}</td>
            <td class="cart-list-price">${p.price}</td>
            <td class="cart-list-amount">${p.number}</td>
            </tr>
            `
        });

        let sum = 0;
        dataList.forEach(data => {
            const price = parseInt(data.price);
            const number = data.number;
            sum += price * number;
        });
        str +=
            `
        <tr class="cart-total">
        <td class="cart-total-label">總計</td>
        <td colspan="2" class="cart-total-price">$ ${sum} NTD</td>
        </tr>
        `;

        document.querySelector(`.cart-list-table`).innerHTML = str;
    };

}