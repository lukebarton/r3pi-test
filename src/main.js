import { products, checkout, getReceipt } from './store';

var basketItems = {
  apple: 3,
  orange: 3,
  garlic: 5,
  papaya: 6
};

const lineItems = checkout(products, basketItems);
getReceipt(lineItems).map(receiptLine => console.log(receiptLine));
