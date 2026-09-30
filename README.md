# Wingify Event Streamer GTM Template

Wingify Event Streamer is a custom tag template that you can import into your GTM account in order to stream custom events from GTM to Wingify (formerly VWO & AB Tasty). Install the Wingify streamer as a template on GTM and configure the events to be sent to Wingify from GTM. 

### The following features are available :

1. All custom events from GTM along with their properties can be forwarded/streamed to Wingify. Further, these events can be used in Wingify to run tests and campaigns.
2. Option to exclude events from being sent to Wingify.
3. Option to exclude properties from being sent to Wingify.

Setup guide is available at: [https://help.wingify.com/hc/en-us/articles/58832481445913-Stream-Events-From-GTM-to-Wingify](https://help.wingify.com/hc/en-us/articles/58832481445913-Stream-Events-From-GTM-to-Wingify)

Each event is pushed to both the VWO and Wingify on-page queues. When **Send Events for Feature Experiments or Offline Conversions** is enabled, the tag also posts that event to `https://edge.wingify.net`.

**Content Security Policy:** Some sites block these requests. Allow the Wingify domain in the page policy, including `https://*.wingify.com` and `https://edge.wingify.net` (US, plus `/eu01` and `/as01` for the other regions). Add `https://edge.wingify.net` to `connect-src`. Without that, the event POST can be blocked.


## Testing

Template test cases are a valid proof of testing for the template logic — they run the tag functions in GTM’s sandbox environment and verify expected behavior there.

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