# Wingify Event Streamer GTM Template

Wingify Event Streamer is a custom tag template that you can import into your GTM account in order to stream custom events from GTM to Wingify (formerly VWO & AB Tasty). Install the Wingify streamer as a template on GTM and configure the events to be sent to Wingify from GTM. 

### The following features are available :

1. All custom events from GTM along with their properties can be forwarded/streamed to Wingify. Further, these events can be used in Wingify to run tests and campaigns.
2. Option to exclude events from being sent to Wingify.
3. Option to exclude properties from being sent to Wingify.
4. Nested JSON field paths, including every value in an array.

### Nested JSON field paths

In **Nested JSON Field Mapping**, JSON Key Path reads one value or every value in an array.

| Path | Result for prices 10, 20 and 30 |
| --- | --- |
| `items[].price` | `10,20,30` |
| `items[].price.sum()` | `60` |
| `items[].price.count()` | `3` |
| `items[0].price` | `10` |

`items[].price` is the default and returns comma-separated text. Add `.sum()` to add the numbers, or `.count()` to count the values that were found. A missing field is skipped. `.sum()` adds numbers and numeric strings and ignores anything else. An empty array returns `0` for `.sum()` and `.count()`. The comma-separated property is left unset when the array is empty. A value that contains a comma or quote is quoted. Dotted paths such as `ecommerce.purchase.actionfield.revenue` stay a single value.

Setup guide is available at: [https://help.wingify.com/hc/en-us/articles/58832481445913-Stream-Events-From-GTM-to-Wingify](https://help.wingify.com/hc/en-us/articles/58832481445913-Stream-Events-From-GTM-to-Wingify)

## Testing

Template test cases are a valid proof of testing for the template logic — they run the tag functions in GTM’s sandbox environment and verify expected behavior there.

The same cases can be run locally with Node, which executes the template code with stand-in GTM APIs:

```
node template.test.js
```

However, sandbox tests alone are not sufficient for a production-ready change. Always also:

1. Import or update the template in a real GTM container.
2. Configure and fire the tag against a live (or staging) site with VWO/Wingify installed.
3. Confirm events and properties are received correctly in VWO/Wingify.

Treat automated sandbox tests as coverage of unit-level behavior, and manual end-to-end testing in a real environment as a required final check before release.

## Code of Conduct

[Code of Conduct](https://github.com/wingify/vwo-event-streamer-gtm-template/blob/master/CODE_OF_CONDUCT.md)

## License

[Apache License, Version 2.0](https://github.com/wingify/vwo-event-streamer-gtm-template/blob/master/LICENSE)

Copyright 2023 Wingify Software Pvt. Ltd.