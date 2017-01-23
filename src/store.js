import padEnd from 'pad-right';
import numeral from 'numeral';
import numeralen from "numeral/locales/en-gb";

numeral.locale('en-gb');



export const products = {
  apple: {
    name: 'Apple',
    price: 0.25
  },
  orange: {
    name: 'Orange',
    price: 0.30
  },
  garlic: {
    name: 'Garlic',
    price: 0.15
  },
  papaya: {
    name: 'Papaya',
    price: 0.50,
    offer: {
      name: '* Buy 2 Papayas, get 1 free',
      minPurchase: 3,
      discount: -0.50
    }
  }
};

export function getCheckoutItems(products, basketItems) {
  return Object.keys(basketItems).map((productId) => {
    const product = products[productId];
    const quantity = basketItems[productId];
    return {
      ...product,
      quantity,
      total: quantity * product.price
    }
  });
}

export function getDiscount(checkoutItem) {
  if (checkoutItem.offer) {
    const numDiscountsToApply = Math.floor(checkoutItem.quantity/checkoutItem.offer.minPurchase);
    if (numDiscountsToApply > 0) {
      return {
        name: checkoutItem.offer.name,
        price: checkoutItem.offer.discount,
        quantity: numDiscountsToApply,
        total: checkoutItem.offer.discount * numDiscountsToApply
      }
    }
  }
}

// apply discounts
export function getLineItems(checkoutItems) {
  return [
    ...checkoutItems,
    ...checkoutItems.map(getDiscount).filter(v => v !== undefined)
  ]
}

export function checkout(products, basketItems) {
  return getLineItems(getCheckoutItems(products, basketItems)) ;
}

export function receiptPad(value, length) {
  return padEnd(value, length, ' ').slice(0, length);
}

export function getReceiptLine(name, quantity, price, total) {
  return receiptPad(String(name), 35) + ' ' +
    receiptPad(String(quantity), 5) + ' ' + 
    receiptPad(price, 10) + ' ' + 
    receiptPad(total, 10);
}

export function getReceipt(lineItems) {
  const subtotal = lineItems.map(lineItem => lineItem.total) .reduce((subtotal, total) => subtotal + total);
  return [
    getReceiptLine('Name', 'Qty', 'Price', 'Total'),
    ...lineItems.map(lineItem => getReceiptLine(lineItem.name, lineItem.quantity, numeral(lineItem.price).format('$0.00'), numeral(lineItem.total).format('$0.00'))),
    '-'.repeat(60),
    getReceiptLine('Total', '', '', numeral(subtotal).format('$0.00'))
  ];
}
