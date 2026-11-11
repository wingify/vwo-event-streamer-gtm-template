const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const template = fs.readFileSync(path.join(__dirname, 'template.tpl'), 'utf8');
const start = template.indexOf('___SANDBOXED_JS_FOR_WEB_TEMPLATE___');
const end = template.indexOf('___WEB_PERMISSIONS___');
const code = template.slice(start, end).replace('___SANDBOXED_JS_FOR_WEB_TEMPLATE___', '');

function getType(value) {
  if (value === null) {
    return 'null';
  }
  if (Array.isArray(value)) {
    return 'array';
  }
  return typeof value;
}

function makeInteger(value) {
  if (typeof value === 'number' && isFinite(value)) {
    return Math.trunc(value);
  }
  if (typeof value === 'string' && /^-?\d+$/.test(value.trim())) {
    return parseInt(value, 10);
  }
  return undefined;
}

function makeNumber(value) {
  if (typeof value === 'number' && isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '' && isFinite(Number(value))) {
    return Number(value);
  }
  return undefined;
}

function runTemplate(eventObject, templateData) {
  let pushed;
  const context = {
    require(name) {
      const apis = {
        copyFromDataLayer(key) {
          if (key === 'gtm.uniqueEventId') {
            return eventObject['gtm.uniqueEventId'];
          }
          return undefined;
        },
        copyFromWindow() {
          return [eventObject];
        },
        createQueue() {
          return function(payload) {
            pushed = payload;
          };
        },
        getType,
        logToConsole() {},
        JSON: { stringify: JSON.stringify, parse: JSON.parse },
        queryPermission() {
          return true;
        },
        getUrl() {
          return '';
        },
        makeInteger,
        makeNumber,
        getTimestampMillis() {
          return 1;
        }
      };
      if (!Object.prototype.hasOwnProperty.call(apis, name)) {
        throw new Error('Unexpected API ' + name);
      }
      return apis[name];
    },
    data: Object.assign({ gtmOnSuccess() {} }, templateData)
  };
  vm.createContext(context);
  vm.runInContext(code, context, { filename: 'template.tpl' });
  assert.ok(pushed, 'expected a VWO.push payload');
  return pushed[2];
}

const purchase = {
  event: 'purchase',
  'gtm.uniqueEventId': 1,
  ecommerce: {
    purchase: {
      actionfield: { revenue: 42 }
    },
    items: [
      { price: 10, name: 'hat' },
      { price: 0, name: 'free, gift' },
      { price: false, name: 'nope' },
      { name: 'missing price' }
    ]
  }
};

const tests = [
  {
    name: 'returns every array value as CSV',
    run() {
      const props = runTemplate(purchase, {
        nestedFieldsMapping: [{
          json_key_name: 'item_prices',
          json_key_path: 'ecommerce.items[].price'
        }]
      });
      assert.strictEqual(props.item_prices, '10,0,false');
    }
  },
  {
    name: 'sums numeric array values and ignores the rest',
    run() {
      const props = runTemplate(purchase, {
        nestedFieldsMapping: [{
          json_key_name: 'price_sum',
          json_key_path: 'ecommerce.items[].price.sum()'
        }]
      });
      assert.strictEqual(props.price_sum, 10);
    }
  },
  {
    name: 'counts values collected from an array',
    run() {
      const props = runTemplate(purchase, {
        nestedFieldsMapping: [{
          json_key_name: 'price_count',
          json_key_path: 'ecommerce.items[].price.count()'
        }]
      });
      assert.strictEqual(props.price_count, 3);
    }
  },
  {
    name: 'quotes CSV cells that contain a comma',
    run() {
      const props = runTemplate(purchase, {
        nestedFieldsMapping: [{
          json_key_name: 'item_names',
          json_key_path: 'ecommerce.items[].name'
        }]
      });
      assert.strictEqual(props.item_names, 'hat,"free, gift",nope,missing price');
    }
  },
  {
    name: 'keeps a single indexed path as its original value',
    run() {
      const props = runTemplate(purchase, {
        nestedFieldsMapping: [{
          json_key_name: 'first_price',
          json_key_path: 'ecommerce.items[0].price'
        }]
      });
      assert.strictEqual(props.first_price, 10);
    }
  },
  {
    name: 'keeps a dotted object path unchanged',
    run() {
      const props = runTemplate(purchase, {
        nestedFieldsMapping: [{
          json_key_name: 'revenue',
          json_key_path: 'ecommerce.purchase.actionfield.revenue'
        }]
      });
      assert.strictEqual(props.revenue, 42);
    }
  },
  {
    name: 'returns zero when sum or count runs on an empty array',
    run() {
      const props = runTemplate({
        event: 'view_item_list',
        'gtm.uniqueEventId': 2,
        items: []
      }, {
        nestedFieldsMapping: [{
          json_key_name: 'price_sum',
          json_key_path: 'items[].price.sum()'
        }, {
          json_key_name: 'price_count',
          json_key_path: 'items[].price.count()'
        }, {
          json_key_name: 'prices',
          json_key_path: 'items[].price'
        }]
      });
      assert.strictEqual(props.price_sum, 0);
      assert.strictEqual(props.price_count, 0);
      assert.strictEqual(Object.prototype.hasOwnProperty.call(props, 'prices'), false);
    }
  },
  {
    name: 'sums prices nested in more than one array',
    run() {
      const props = runTemplate({
        event: 'purchase',
        'gtm.uniqueEventId': 3,
        orders: [
          { items: [{ price: 5 }, { price: '7' }] },
          { items: [{ price: 8 }] }
        ]
      }, {
        nestedFieldsMapping: [{
          json_key_name: 'price_sum',
          json_key_path: 'orders[].items[].price.sum()'
        }]
      });
      assert.strictEqual(props.price_sum, 20);
    }
  }
];

let failed = 0;
for (const test of tests) {
  try {
    test.run();
    console.log('ok - ' + test.name);
  } catch (error) {
    failed += 1;
    console.error('not ok - ' + test.name);
    console.error(error);
  }
}

if (failed) {
  process.exit(1);
}
