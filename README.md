# » Frontity - WPorg Connection

[![Build Status](https://travis-ci.org/frontity/wp-org-connection.svg?branch=master)](https://travis-ci.org/frontity/wp-org-connection)

This package connects the [» Frontity](https://github.com/frontity/frontity) framework with a self-hosted WordPress.org site.

## Installation

Clone the main [» Frontity](https://github.com/frontity/frontity) repository first. Then, inside the `packages` folder, clone this repository.

Finally, use `npm run start:pwa` to start the development environment.

# Settings

These are the settings you can configure in the `data` field of `wp-org-connection`:

## `endpoint` (required)

The endpoint where your WP REST API is located:

```json
{
    "endpoint": "https://my-blog.com/wp-json"
}
```

Alternatively, if you want to access data from more than one endpoint, you can pass an object. In this case, `default` is required:

```json
{
    "endpoint": {
        "default": "https://my-blog.com/wp-json",
        "mainSite": "https://my-main-site.com/wp-json"
    }
}
```

## `perPage`

The number of items per page each time a list is requested. Default is `10`.

```json
{
    "perPage": 13
}
```

> It is recommended to mimic your WP settings.

## `timezone` (WIP, not implemented yet)

The timezone of your WP. Default is `GTM`. 

```json
{
    "timezone": "GTM+02"
}
```

> It is recommended to mimic your WP settings.


## Changelog

Please take a look at our [Changelog file](https://github.com/frontity/wp-org-connection/blob/master/CHANGELOG.md).

## Contribute

Please take a look at our [Contribution Guide](https://github.com/frontity/contribute).

## License

This project is licensed under the terms of the [Apache 2.0](https://github.com/frontity/wp-org-connection/blob/master/LICENSE) license.
