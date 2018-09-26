## [0.9.4](https://github.com/frontity/wp-org-connection/compare/v0.9.3...v0.9.4) (2018-09-26)


### Bug Fixes

* **media:** use original src and width for srcset if no sizes ([f76a719](https://github.com/frontity/wp-org-connection/commit/f76a719))

## [0.9.3](https://github.com/frontity/wp-org-connection/compare/v0.9.2...v0.9.3) (2018-08-31)


### Bug Fixes

* **entity:** check if sizes.length is not 0 before reducing the array ([09f0585](https://github.com/frontity/wp-org-connection/commit/09f0585))

## [0.9.2](https://github.com/frontity/wp-org-connection/compare/v0.9.1...v0.9.2) (2018-08-29)


### Bug Fixes

* **head-meta:** fix bug with title when entity is not ready yet ([8169e30](https://github.com/frontity/wp-org-connection/commit/8169e30))

## [0.9.1](https://github.com/frontity/wp-org-connection/compare/v0.9.0...v0.9.1) (2018-08-23)


### Bug Fixes

* **head-content:** filters out meta tags with invalid attributes ([428bb6e](https://github.com/frontity/wp-org-connection/commit/428bb6e))

# [0.9.0](https://github.com/frontity/wp-org-connection/compare/v0.8.1...v0.9.0) (2018-08-16)


### Features

* **api:** uses cdn for api if available ([a367eaf](https://github.com/frontity/wp-org-connection/commit/a367eaf))
* **media:** adds src and srcSet fields to media entity ([00c23ca](https://github.com/frontity/wp-org-connection/commit/00c23ca))

## [0.8.1](https://github.com/frontity/wp-org-connection/compare/v0.8.0...v0.8.1) (2018-07-25)


### Bug Fixes

* **head-meta:** fix headMeta shape ([82365e9](https://github.com/frontity/wp-org-connection/commit/82365e9))
* **paged-link:** add trailing slash to paged links ([94202c8](https://github.com/frontity/wp-org-connection/commit/94202c8))

# [0.8.0](https://github.com/frontity/wp-org-connection/compare/v0.7.0...v0.8.0) (2018-07-17)


### Bug Fixes

* **head-content:** calls fetchHeadContent in beforeSsr ([0f5e9ca](https://github.com/frontity/wp-org-connection/commit/0f5e9ca))


### Features

* **entity:** create HeadMeta model with title and pagedTitle  views ([13c6f27](https://github.com/frontity/wp-org-connection/commit/13c6f27))
* **flows:** removes flows ([696b05c](https://github.com/frontity/wp-org-connection/commit/696b05c))
* **stores:** removes flows and adds afterCsr hook ([4dbe933](https://github.com/frontity/wp-org-connection/commit/4dbe933))


### BREAKING CHANGES

* **flows:** removes flows

https://github.com/wp-pwa/saturn-theme/issues/329

# [0.7.0](https://github.com/frontity/wp-org-connection/compare/v0.6.3...v0.7.0) (2018-07-02)


### Bug Fixes

* **amp:** fixes client entry points in AMP ([840a088](https://github.com/frontity/wp-org-connection/commit/840a088))
* **converters:** use date instead of date_gmt for media ([e18be70](https://github.com/frontity/wp-org-connection/commit/e18be70))
* **entity-shape:** add raw to entity shape ([864981d](https://github.com/frontity/wp-org-connection/commit/864981d))
* **normalizr:** missing package ([4b5d45f](https://github.com/frontity/wp-org-connection/commit/4b5d45f))
* **schemas:** solve bug in normalizr ([ad7819a](https://github.com/frontity/wp-org-connection/commit/ad7819a))


### Features

* **entity:** rename .entity to .raw ([2bb5e10](https://github.com/frontity/wp-org-connection/commit/2bb5e10))
