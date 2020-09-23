'use strict'


let List = {
    allProducts: [],

    html: {
        table: null,
        bodyProducts: null,
        quantityProducts: null,
        inputQuantity: null,
        btnStartSearch: null,
        inputSearchArticle: null,
        product: null,
    },

    init() {
        this.html.table = document.querySelector('.table-products');
        this.html.bodyProducts = this.html.table.querySelector('.body-products');

        fetch('data.json').then((response) => response.json()).then(function (responseObject) {

            responseObject.data.forEach(function (product, i) {

                let indexProduct = {
                    name: product[0],
                    code: product[1],
                    price: product[2].replace(new RegExp('^0+'), ''),
                    htmlElement: null
                }


                let row = document.createElement('TR');
                row.classList.add('product');
                row.setAttribute('data-code', `${indexProduct.code}`)
                row.innerHTML = `<th scope="row" class="index">${i}</th>
                    <td class="name-product">${indexProduct.name}</td>
                    <td class="code-product">${indexProduct.code}</td>
                    <td class="price-product">${indexProduct.price}</td>
                    <td class="quantity-product"><input class="quantity" type="number"  min="0" value="0"></td>`;

                indexProduct.htmlElement = row;

                List.allProducts.push(indexProduct);

                List.html.bodyProducts.append(indexProduct.htmlElement);
            });

            List.createCardsProduct();
            List.quantity();

        })
    },
    createCardsProduct(valueForSearch = '') {



        /*List.allProducts.filter(function(item) {
            if (item.code === valueForSearch) {

                let resultProduct = document.querySelector('.code-product');
                let resProdHtml = +resultProduct.innerHTML;

                if (item.code === resProdHtml ) {
                    let parentProduct = resultProduct.closest('.product');

                    parentProduct.classList.add('res');

                }

            }
            let allPr = document.querySelectorAll('.product');
            for (let item of allPr) {
                if (!item.matches('.res')) {
                    item.classList.add('bla-bla');
                }
                /!*item.setAttribute('hidden', 'hidden')*!/


            }
        });*/



        /*for (let i = 0; i < this.allProducts.length; i++) {

            let indexProduct = this.allProducts[i];

            this.html.bodyProducts.append(indexProduct.htmlElement);

        }
*/

    },
    quantity() {
        List.html.inputQuantity = List.html.bodyProducts.querySelectorAll('.quantity');
        for (let inputQuantityValue of List.html.inputQuantity) {
            inputQuantityValue.addEventListener('change', function (event) {
                let productBasket = event.target.closest('.product');
                let article = productBasket.querySelector('.code-product').innerHTML;

                if (event.target.value > 0) {
                    let name = productBasket.querySelector('.name-product').innerHTML;
                    let price = productBasket.querySelector('.price-product').innerHTML;

                    let productData = {
                        name: name,
                        code: article,
                        price: price,
                        count: event.target.value,
                        subtotal: parseInt(price) * parseInt(event.target.value)
                    };
                    MainBasket.basket[article] = productData;

                } else {
                    MainBasket.removeProduct(article);
                }

                MainBasket.calculateAndDrawTotal();
            })
        }
    },
    searchArticle() {


        List.html.inputSearchArticle = document.querySelector('.input-search-article');
        List.html.inputSearchArticle.addEventListener('input', searchArticle);




        function searchArticle(event) {
            event.preventDefault()
            let valueForSearch = +List.html.inputSearchArticle.value;

            List.allProducts.forEach(function(product) {


                product.htmlElement.classList.remove('found');
                product.htmlElement.classList.remove('bla-bla');

                if (product.code === valueForSearch || valueForSearch === 0) {

                    product.htmlElement.classList.add('found');

                } else {
                    product.htmlElement.classList.add('bla-bla');
                }

            });

        }




    }


}

let MainBasket = {
    basket: {},
    html: {
        table: null,
        bodyProducts: null,
        resultTotalSumView: null,
    },

    removeProduct(article) {
        delete MainBasket.basket[article];

    },

    calculateAndDrawTotal() {
        let resultTotalSumView = document.querySelector('.total-price');

        let sum = 0;

        for (let prop in MainBasket.basket) {
            let indexProduct = MainBasket.basket[prop];

            sum += indexProduct.subtotal;

        }

        resultTotalSumView.value = sum + "$";


    },
    initBasket() {
        this.html.table = document.querySelector('.table-products-basket');
        this.html.bodyProducts = this.html.table.querySelector('.body-products-basket');


    },


    drawTable() {
        isEmpty(MainBasket.basket);

        function isEmpty(basket) {
            for (let prop in basket) {
                return false;
            }
            MainBasket.html.bodyProducts.insertAdjacentHTML('beforeend', `<h5 class="notification-select-products mt-4">Корзина пуста. Выберите товары.</h5>`)
            return true;
        }

        let rowIndex = 0;

        for (let prop in MainBasket.basket) {

            let indexProduct = MainBasket.basket[prop];

            rowIndex++;

            let template = `<tr class="product">
                <th scope="row" class="index">${rowIndex}</th>
                <td class="name-product">${indexProduct.name}</td>
                <td class="code-product">${indexProduct.code}</td>
                <td class="price-product">${indexProduct.price}</td>
                <td class="quantity-product"><input class="quantity" readonly type="number" value="${indexProduct.count}"></td>
                <td class="price-product">${indexProduct.subtotal}</td>
            </tr>`;

            this.html.bodyProducts.insertAdjacentHTML('beforeend', `${template}`)

        }
        let finalTotalSumInput = document.querySelector('.total-price-order');

        finalTotalSumInput.value = document.querySelector('.total-price').value;

    },
    deleteTableBasket() {
        MainBasket.html.bodyProducts.innerHTML = '';

    }

}


List.init();
List.searchArticle();
MainBasket.initBasket();


$('#staticBackdrop').on('show.bs.modal', function (e) {
    MainBasket.drawTable()
})
$('#staticBackdrop').on('hide.bs.modal', function (e) {
    MainBasket.deleteTableBasket()
})










