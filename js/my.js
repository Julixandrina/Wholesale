'use strict'


let List = {
    allProducts: [],

    html: {
        table: null,
        bodyProducts: null,
        quantityProducts: null,
        inputQuantity: null
    },

    init(){
        this.html.table = document.querySelector('.table-products');
        this.html.bodyProducts = this.html.table.querySelector('.body-products');

        fetch('data.json').then((response) => response.json()).then(function (responseObject) {

            responseObject.data.forEach(function (product) {
                List.allProducts.push({
                    name: product[0],
                    code: product[1],
                    price: product[2].replace(new RegExp('^0+'), ''),
                })
            });

            List.createCardsProduct();
            List.quantity();

        })
    },
    createCardsProduct() {

        for (let i = 0; i < this.allProducts.length; i++) {
            let indexProduct = this.allProducts[i];

            let template = `<tr class="product">
                <th scope="row" class="index">${i}</th>
                <td class="name-product">${indexProduct.name}</td>
                <td class="code-product">${indexProduct.code}</td>
                <td class="price-product">${indexProduct.price}</td>
                <td class="quantity-product"><input class="quantity" type="number"  min="0" value="0"></td>
            </tr>`;

            this.html.bodyProducts.insertAdjacentHTML('beforeend', `${template}`)
        }
    },
    quantity() {
        List.html.inputQuantity = List.html.bodyProducts.querySelectorAll('.quantity');
        for (let inputQuantityValue of List.html.inputQuantity ) {
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
    }


}

let MainBasket = {
    basket: {},
    html: {
        table: null,
        bodyProducts: null,
        resultTotalSumView: null,
    },

    removeProduct(article){
       delete MainBasket.basket[article];

       },

    calculateAndDrawTotal() {
        let resultTotalSumView = document.querySelector('.total-price');

        let sum = 0;

        for(let prop in MainBasket.basket) {
            let indexProduct = MainBasket.basket[prop];

            sum += indexProduct.subtotal;

        }

       resultTotalSumView.value = sum + "$";


    },
    initBasket(){
        this.html.table = document.querySelector('.table-products-basket');
        this.html.bodyProducts = this.html.table.querySelector('.body-products-basket');



    },


    drawTable() {

        let rowIndex = 0;

        for(let prop in MainBasket.basket) {
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
MainBasket.initBasket();


$('#staticBackdrop').on('show.bs.modal', function (e) {
    MainBasket.drawTable()
})
$('#staticBackdrop').on('hide.bs.modal', function (e) {
    MainBasket.deleteTableBasket()
})









