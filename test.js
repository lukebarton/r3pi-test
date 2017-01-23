import test from 'ava';
import {
  receiptPad,
  getReceiptLine,
  getReceipt,
  getCheckoutItems,
  getDiscount,
  getLineItems
} from './src/store';

test('receiptPad', t => {
  t.is(receiptPad('foobar',  5), 'fooba');
  t.is(receiptPad('foobar', 10), 'foobar    ');
  t.is(receiptPad('', 10), '          ');
});

test('getReceiptLine', t => {
  t.is(
    getReceiptLine('An Item', 'foo', 'bar', 'baz'), 
    'An Item                            ' + ' ' + 'foo  ' + ' ' + 'bar       ' + ' ' + 'baz       ',
    'Number formatted and space padded correctly'
  );
  t.is(
    getReceiptLine('An Item with a really long values which get truncated', 'foo1234567890', 'bar1234567890', 'baz1234567890'), 
    'An Item with a really long values w' + ' ' + 'foo12' + ' ' + 'bar1234567' + ' ' + 'baz1234567',
    'Truncated'
  );
});

test('getReceipt', t => {
  const receipt = getReceipt([
    { name: 'An Item', quantity: 333, price: 123.45, total: 543.21 },
    { name: 'Another Item', quantity: 666, price: 111.11, total: 222.22 },
  ]);
  t.is(receipt[0], 'Name                                Qty   Price      Total     ');
  t.is(receipt[1], 'An Item                             333   £123.45    £543.21   ');
  t.is(receipt[2], 'Another Item                        666   £111.11    £222.22   ');
  t.is(receipt[3].slice(0,1), '-');
  t.is(receipt[4], 'Total                                                £765.43   ', 'Total is correct')
});


test('getCheckoutItems', t => {
  const products = {
    'foo': { name: 'Foo Product', price: 6.5 },
    'bar': { name: 'Bar Product', price: 7.5, offer: 'SomeOffer' }
  };
  const basketItems = {
    'bar': 3,
    'foo': 2,
  };
  const checkoutItems = getCheckoutItems(products, basketItems);
  
  t.deepEqual(checkoutItems[0], { name: 'Bar Product', price: 7.5, quantity: 3, total: 22.5, offer: 'SomeOffer' });
  t.deepEqual(checkoutItems[1], { name: 'Foo Product', price: 6.5, quantity: 2, total: 13 });
  
  t.deepEqual(getCheckoutItems({}, []), [], 'Empty BasketItems');
});

test('getDiscount', t => {
  const lineItem = { name: 'Bar Product', price: 7.5, quantity: 2, total: 22.5 };
  const offer = { name: 'This Offer', minPurchase: 3, discount: -10 };
  
  t.deepEqual(getDiscount(lineItem), undefined);
  t.deepEqual(getDiscount({ ...lineItem, offer }), undefined);
  t.deepEqual(getDiscount({ ...lineItem, offer, quantity: 3 }), { name: 'This Offer', quantity: 1, price: -10, total: -10 });
  t.deepEqual(getDiscount({ ...lineItem, offer, quantity: 4 }), { name: 'This Offer', quantity: 1, price: -10, total: -10 });
  t.deepEqual(getDiscount({ ...lineItem, offer, quantity: 5 }), { name: 'This Offer', quantity: 1, price: -10, total: -10 });
  t.deepEqual(getDiscount({ ...lineItem, offer, quantity: 6 }), { name: 'This Offer', quantity: 2, price: -10, total: -20 });
});

test('getLineItems with no discount', t => {
  const checkoutItems = [
    { name: 'Foo Product', price: 6.5, quantity: 2, total: 13 },
    { name: 'Bar Product', price: 7.5, quantity: 2, total: 22.5, offer: { name: 'This Offer', minPurchase: 3, discount: -10 } }
  ];
  t.deepEqual(getLineItems(checkoutItems), checkoutItems);
});

test('getLineItems with discount', t => {
  const checkoutItems = [
    { name: 'Foo Product', price: 6.5, quantity: 2, total: 13 },
    { name: 'Bar Product', price: 7.5, quantity: 3, total: 22.5, offer: { name: 'This Offer', minPurchase: 3, discount: -10 } }
  ];
  t.deepEqual(
    getLineItems(checkoutItems),
    [ 
      ...checkoutItems, 
      { name: 'This Offer', price: -10, quantity: 1, total: -10 } 
    ]
  );
});