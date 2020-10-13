'use strict'

const URL_PRODUCTS_JSON = 'https://chatcleaner-bot.s3.eu-west-1.amazonaws.com/product.json';
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

        fetch(URL_PRODUCTS_JSON).then((response) => response.json()).then(function (responseObject) {

            responseObject.data.forEach(function (product, i) {

                let indexProduct = {
                    name: product[0],
                    code: product[1],
                    price: (typeof product[2] === "string" && product[2].substr(0,1) === '0') ? product[2].replace(new RegExp('^0+'), '') : product[2],
                    htmlElement: null
                }


                let row = document.createElement('TR');
                row.classList.add('product');
                row.innerHTML = `<th scope="row" class="index">${i + 1}</th>
                    <td class="name-product">${indexProduct.name}</td>
                    <td class="code-product">${indexProduct.code}</td>
                    <td class="price-product">${indexProduct.price}</td>
                    <td class="quantity-product"><input class="quantity" type="number"  min="0" value="0"></td>`;
                indexProduct.htmlElement = row;

                List.allProducts.push(indexProduct);

                List.html.bodyProducts.append(indexProduct.htmlElement);
            });

            List.quantity();

        })
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
            let valueForSearch = List.html.inputSearchArticle.value;

            List.allProducts.forEach(function (product) {

                let productCode = product.code.toString();

                product.htmlElement.classList.remove('found-product');
                product.htmlElement.classList.remove('d-none');

                if (productCode.includes(valueForSearch) || product.name.includes(valueForSearch)) {

                    product.htmlElement.classList.add('found-product');

                } else {
                    product.htmlElement.classList.add('d-none');
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
        headTableModal: null,
        btnSubmitBasketModal: null,
        inputNameCompany: null,
        inputAddressCompany: null,
        inputTelCompany: null,
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
        this.html.headTableModal = this.html.table.querySelector('.head-table-modal');
        this.html.btnSubmitBasketModal = document.querySelector('.btn-submit-basket-modal');
        this.html.inputNameCompany = document.getElementById('inputNameCompany');
        this.html.inputAddressCompany = document.getElementById('inputAddressCompany');
        this.html.inputTelCompany = document.getElementById('inputTelCompany');

        this.html.btnSubmitBasketModal.addEventListener('click', MainBasket.postOrder)

    },

    postOrder() {
        let formPost = {
            products: MainBasket.basket,
            nameCompany: MainBasket.html.inputNameCompany.value,
            inputVariantPay: document.getElementById('inputVariantPay').value,
            inputAddressCompany: MainBasket.html.inputAddressCompany.value,
            inputTelCompany: MainBasket.html.inputTelCompany.value,
        }

        let isInputsOk = true;

        if (formPost.nameCompany.length < 1) {
            isInputsOk = false;
            MainBasket.html.inputNameCompany.classList.add('is-invalid');
        } else {
            MainBasket.html.inputNameCompany.classList.remove('is-invalid');
        }

        if (formPost.inputAddressCompany.length < 1) {
            isInputsOk = false;
            MainBasket.html.inputAddressCompany.classList.add('is-invalid');
        } else {
            MainBasket.html.inputAddressCompany.classList.remove('is-invalid');
        }

        if (formPost.inputTelCompany.length < 1) {
            isInputsOk = false;
            MainBasket.html.inputTelCompany.classList.add('is-invalid');
        } else {
            MainBasket.html.inputTelCompany.classList.remove('is-invalid');
        }

        if (!isInputsOk) {
            return;
        }

        MainBasket.html.btnSubmitBasketModal.setAttribute('disabled', 'disabled');

        fetch('https://webhook.site/e961d78b-687a-4377-9f7a-82c2bf3a3d6c', {
            method: 'POST',
            body: JSON.stringify(formPost),
            headers: {'content-type': 'application/json'}
        })
            .then(function () {

                MainBasket.html.btnSubmitBasketModal.removeAttribute('disabled');

                $('#staticBackdrop').one('hidden.bs.modal', function (e) {
                    $('#thankYouModal').modal('show');
                });

                $('#staticBackdrop').modal('hide');

            })
            .catch(alert);
        MainBasket.html.btnSubmitBasketModal.removeAttribute('disabled');
    },

    drawTable() {
        isEmpty(MainBasket.basket);

        function isEmpty(basket) {
            for (let prop in basket) {
                MainBasket.html.headTableModal.classList.remove('d-none');
                MainBasket.html.btnSubmitBasketModal.removeAttribute('disabled');
                return false;
            }
            MainBasket.html.headTableModal.classList.add('d-none');
            MainBasket.html.btnSubmitBasketModal.setAttribute('disabled', 'disabled');
            MainBasket.html.bodyProducts.insertAdjacentHTML('beforeend', `<strong class="notification-select-products mt-4">Нет товаров добавленных в корзину.</strong>`)
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
                <td class="quantity-product">${indexProduct.count}</td>
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










