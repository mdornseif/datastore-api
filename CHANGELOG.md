# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [2.0.1](https://github.com/mdornseif/datastore-api/compare/v2.0.0...v2.0.1) (2022-02-08)

## [2.0.0](https://github.com/mdornseif/datastore-api/compare/v1.7.4...v2.0.0) (2022-02-08)


### ⚠ BREAKING CHANGES

* do not collect metrics with `kindName`

### Bug Fixes

* do not collect metrics with `kindName` ([00495f7](https://github.com/mdornseif/datastore-api/commit/00495f7093505b2de2d7a9693aad54253d363eb0))
* getMulti returns results for all keys ([ca9cad2](https://github.com/mdornseif/datastore-api/commit/ca9cad292cfebf2284529496d82eceea05baf02d))

### [1.7.4](https://github.com/mdornseif/datastore-api/compare/v1.7.3...v1.7.4) (2022-02-07)


### Bug Fixes

* do not tread JS slices like Python slices ([fd9d13d](https://github.com/mdornseif/datastore-api/commit/fd9d13d770928e198001464977ac47ffc008f46f))

### [1.7.3](https://github.com/mdornseif/datastore-api/compare/v1.7.2...v1.7.3) (2022-02-06)


### Bug Fixes

* Preserve Stacktraces in errors ([dda1777](https://github.com/mdornseif/datastore-api/commit/dda177778e5dd08ca363b00ff868ec15071afc36))

### [1.7.2](https://github.com/mdornseif/datastore-api/compare/v1.7.1...v1.7.2) (2022-02-06)


### Bug Fixes

* Correctly pit kindName into metrics ([0da9d2c](https://github.com/mdornseif/datastore-api/commit/0da9d2ca2927c4c0dbb793bcc89b4742610a82e7))
* Throw original errors & fix type of set(key, data) ([84a0cbd](https://github.com/mdornseif/datastore-api/commit/84a0cbda78119bc6bef7a710b5bf137fdea1f9cb))

### [1.7.1](https://github.com/mdornseif/datastore-api/compare/v1.7.0...v1.7.1) (2022-01-31)


### Bug Fixes

* Prometheus metric names ([551c6fa](https://github.com/mdornseif/datastore-api/commit/551c6fad3cfea10f1a452cf12083a91848468510))

## [1.7.0](https://github.com/mdornseif/datastore-api/compare/v1.6.0...v1.7.0) (2022-01-30)


### Features

* use prop-client to collect datastore metrics ([e55ff06](https://github.com/mdornseif/datastore-api/commit/e55ff06c8e069ca0df798c1e1f34c2eb9bf9079b))

## [1.6.0](https://github.com/mdornseif/datastore-api/compare/v1.5.0...v1.6.0) (2022-01-10)


### Features

* catch incomplete keys before trying to update the datastore ([1132e3b](https://github.com/mdornseif/datastore-api/commit/1132e3b52913d83b189c7bf94101c6df162f87df))

## [1.5.0](https://github.com/mdornseif/datastore-api/compare/v1.4.0...v1.5.0) (2022-01-06)


### Features

* provide  _keyStr also in queries ([fe7e90b](https://github.com/mdornseif/datastore-api/commit/fe7e90b3011e08de552e1b4e35b1ad110efa6b1b))

## [1.4.0](https://github.com/mdornseif/datastore-api/compare/v1.3.0...v1.4.0) (2022-01-04)


### Features

* save() adds _keyStr the same way get() does ([f4f6452](https://github.com/mdornseif/datastore-api/commit/f4f6452c77046c0ee8d0b6ddfe2ec6744a4968bd))

## [1.3.0](https://github.com/mdornseif/datastore-api/compare/v1.2.0...v1.3.0) (2022-01-03)


### Features

* Set excludeLargeProperties by default. ([289cd28](https://github.com/mdornseif/datastore-api/commit/289cd289651b0c34f36098370b3dfbe249790c5a))

## [1.2.0](https://github.com/mdornseif/datastore-api/compare/v1.1.3...v1.2.0) (2021-12-30)


### Features

* add `query(... selection)` ([e9f8053](https://github.com/mdornseif/datastore-api/commit/e9f8053fa98f496e69ccf83e649e7c1502751f16))
* add KEYSYM ([d97eff0](https://github.com/mdornseif/datastore-api/commit/d97eff09f0c7dd60caa860eda45975438d369920))
* debug log; removed readonly from several types ([f1fcdb6](https://github.com/mdornseif/datastore-api/commit/f1fcdb62551c3c624fcfd67f550f40a5bbd38138))

### [1.1.3](https://github.com/mdornseif/datastore-api/compare/v1.1.2...v1.1.3) (2021-12-29)

### [1.1.2](https://github.com/mdornseif/datastore-api/compare/v1.1.1...v1.1.2) (2021-12-29)

### [1.1.1](https://github.com/mdornseif/datastore-api/compare/v1.1.0...v1.1.1) (2021-12-29)

## [1.1.0](https://github.com/mdornseif/datastore-api/compare/v1.0.2...v1.1.0) (2021-12-25)


### Features

* mark TGqlFilterList as mutable ([482c0b7](https://github.com/mdornseif/datastore-api/commit/482c0b743a7ebde861448bd927db40b9179c547b))

### [1.0.2](https://github.com/mdornseif/datastore-api/compare/v1.0.1...v1.0.2) (2021-12-24)

### 1.0.1 (2021-12-24)
