## [0.9.8](https://github.com/frontity/wp-org-connection/compare/v0.9.7...v0.9.8) (2018-10-25)


### Bug Fixes

* **react:** update react and react-dom ([351dd72](https://github.com/frontity/wp-org-connection/commit/351dd72))

## [0.9.7](https://github.com/frontity/wp-org-connection/compare/v0.9.6...v0.9.7) (2018-10-25)


### Bug Fixes

* **amp:** use the correct stores ([a05dd3c](https://github.com/frontity/wp-org-connection/commit/a05dd3c))

## [0.9.6](https://github.com/frontity/wp-org-connection/compare/v0.9.5...v0.9.6) (2018-10-24)


### Bug Fixes

* **esmodules:** fixes lodash-es loading in jest and entityshape import ([8d97329](https://github.com/frontity/wp-org-connection/commit/8d97329))
* **head:** move fetchHeadContent to its own file ([c777416](https://github.com/frontity/wp-org-connection/commit/c777416))
* **list:** list.isReady doesn't relay in entities.length [WIP] ([9166d87](https://github.com/frontity/wp-org-connection/commit/9166d87))
* **list-page:** fix isEmpty field and add tests ([c5655ae](https://github.com/frontity/wp-org-connection/commit/c5655ae))
* **list-page:** fix isReady field when list is empty ([9d4c5e3](https://github.com/frontity/wp-org-connection/commit/9d4c5e3))
* **lodash:** migrates back to lodash-es ([9d542fd](https://github.com/frontity/wp-org-connection/commit/9d542fd))
* **lodash:** removes lodash-es and installs lodash ([1f30e75](https://github.com/frontity/wp-org-connection/commit/1f30e75))
* **stores:** use afterCsr only in the client ([ec3ae3f](https://github.com/frontity/wp-org-connection/commit/ec3ae3f))
* **stores:** use beforeSsr only in the server ([4a8ae4f](https://github.com/frontity/wp-org-connection/commit/4a8ae4f))
* **tests:** install missing dev dependencies ([88941a8](https://github.com/frontity/wp-org-connection/commit/88941a8))

## [0.9.5](https://github.com/frontity/wp-org-connection/compare/v0.9.4...v0.9.5) (2018-10-02)


### Bug Fixes

* **context:** get next column and extract list at the same time ([1de490e](https://github.com/frontity/wp-org-connection/commit/1de490e))
* **item:** change afterCreate hook and fix nextItem view ([7914cc4](https://github.com/frontity/wp-org-connection/commit/7914cc4))

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
