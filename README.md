# Currency Converter

Open index.html in a modern browser with an internet connection. No installation or API key is required.

The converter uses the current Fawaz Ahmed Currency API and automatically tries its Cloudflare mirror if the primary request fails. Rates are daily reference rates; the provider's date is displayed with each conversion.

Features: USD to PKR defaults, currency swap, decimal and zero amounts, formatted results, accessible labels and status messages, responsive layout, eight-second provider timeouts, and five-minute in-memory caching. Older currency codes have been updated or removed. Flags are decorative and hide if unavailable.

API documentation: https://github.com/fawazahmed0/exchange-api

Validation: JavaScript syntax checks and mocked conversion, fallback, decimal, zero, invalid amount, identical currency, and network-error scenarios passed. Live endpoint verification was blocked by an SSL connection error in the development environment.
