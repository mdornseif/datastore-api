## [6.0.2](https://github.com/mdornseif/datastore-api/compare/v6.0.1...v6.0.2) (2024-04-15)


### Bug Fixes

* ensure set() does not write `_keyStr` to the datastore ([0e6c792](https://github.com/mdornseif/datastore-api/commit/0e6c7929dc899c8f8a354c7a42bfb866fa1b61a8))

## [6.0.1](https://github.com/mdornseif/datastore-api/compare/v6.0.0...v6.0.1) (2024-01-16)


### Bug Fixes

* deps ([099b82e](https://github.com/mdornseif/datastore-api/commit/099b82eb595277b9e5902fccc464e3c87601947d))

# [5.0.0](https://github.com/mdornseif/datastore-api/compare/v4.0.1...v5.0.0) (2024-01-16)


### Bug Fixes

* automatic release ([90976cb](https://github.com/mdornseif/datastore-api/commit/90976cb5184e396e6e9eb893142244d321c2fafd))
* automatic releases ([2789ec1](https://github.com/mdornseif/datastore-api/commit/2789ec16d72935cf2aa9168e2359a41c9b2a408a))
* deps ([530830c](https://github.com/mdornseif/datastore-api/commit/530830c72f228ea8b663bb1c7c7b62cc99e56894))
* deps ([b47cf0a](https://github.com/mdornseif/datastore-api/commit/b47cf0ad3846361297aa0d6576049c2c833fff5f))
* **deps:** @google/cloud-datastore dependency version range ([c251705](https://github.com/mdornseif/datastore-api/commit/c25170533c842db0cc2b6209951410239e668b4f))
* double versioning ([2f9962f](https://github.com/mdornseif/datastore-api/commit/2f9962fb8259cadfbe537a40687f53344e72bd3f))
* Ensure package.version is updated in git ([5dd5f3f](https://github.com/mdornseif/datastore-api/commit/5dd5f3f269a463205c9cb47fb2ea138b8314f439))
* for now, do not publish documentation ([49f535a](https://github.com/mdornseif/datastore-api/commit/49f535a037d3b7cfeee49c71f924fd315924c947))
* **Typings:** Allow empty Datastore Entities in `IDstoreEntryWithoutKey`. ([763cdaa](https://github.com/mdornseif/datastore-api/commit/763cdaa3459f2f42f861ee785c8669939d641613))
* typo ([bd61266](https://github.com/mdornseif/datastore-api/commit/bd612665212556e167ba003a7453deb5bf830750))
* typo ([f34e146](https://github.com/mdornseif/datastore-api/commit/f34e146d5e3c621e96f9e97542ba782e198fd746))
* typo ([4b02261](https://github.com/mdornseif/datastore-api/commit/4b0226113d4b394d91bf91723dcc2072cf985962))
* versioning ([dd6a598](https://github.com/mdornseif/datastore-api/commit/dd6a5981483058d5ff13ff97ac4342d66724153e))


### Features

* Support HMR ([5d13e95](https://github.com/mdornseif/datastore-api/commit/5d13e9510e676a7059781b65353de5aed9237fa7))


### BREAKING CHANGES

* **Typings:** Cascading Change to typings.

# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [4.0.0](https://github.com/mdornseif/datastore-api/compare/v2.0.1...v4.0.0) (2023-10-24)


### ⚠ BREAKING CHANGES

* if you relied on _keyStr in the Datastore.

### Features

* Add `Dstore.engine` identifier to allow debugging of nested stacks ([d5cba67](https://github.com/mdornseif/datastore-api/commit/d5cba6715a9e22e2cc5482347437f9b223be2c12))
* Do not save _keyStr to Datastore ([909a4c9](https://github.com/mdornseif/datastore-api/commit/909a4c91a0c43d15b7ca299796256839de7861f8))
* **docs:** Automatically Publish Documentation on new releases ([3cea768](https://github.com/mdornseif/datastore-api/commit/3cea76874e355a2f1df38d156d5d5cac264971c7))
* test against datastore-emulator ([65b000a](https://github.com/mdornseif/datastore-api/commit/65b000abe0f077c9220f377beb3003d33542975f))
* **Tests:** Test against the real cloud firestore / datastore ([8f28a4c](https://github.com/mdornseif/datastore-api/commit/8f28a4c23bdef1768be2732d37882030aff1d5ee))
* use @google-cloud/datastore 8.x PropertyFilter ([371da2a](https://github.com/mdornseif/datastore-api/commit/371da2a96712ffdf24bbc69e27acf2740078efbe))


### Bug Fixes

* **build:** export correct modules ([ff117b4](https://github.com/mdornseif/datastore-api/commit/ff117b42bc36585776d300e8cf84484a8838c633))
* bump version ([544c6ce](https://github.com/mdornseif/datastore-api/commit/544c6cef6ca5c6ee05f88e4914faaccaee3d7eca))
* **CI:** added missint `lint` target ([0e23765](https://github.com/mdornseif/datastore-api/commit/0e2376583c1ab5dbbaded31bcfc1800b4807eed6))
* **CI:** Google-Auth ([2357580](https://github.com/mdornseif/datastore-api/commit/23575803e608b005e0d9a5ae30c5f79b89b5e45e))
* **CI:** use changed action for gcloud ([a7a280f](https://github.com/mdornseif/datastore-api/commit/a7a280fc32890ea5f6df18cc5b3dd9b869445ec2))
* datastore.simulator handling queries without filters ([13bedcb](https://github.com/mdornseif/datastore-api/commit/13bedcb9869473af03806f2d8c33c69ce0095a82))
* **deps:** eslint ([0386f25](https://github.com/mdornseif/datastore-api/commit/0386f25f492a4b1d0aebd2b71a13437a51e3dad2))
* https://github.com/mdornseif/datastore-api/releases/tag/v2.1.0 ([80ec1b0](https://github.com/mdornseif/datastore-api/commit/80ec1b0a4254bd30c51e204163abaabf70a23415))
* lint ([7f5cd36](https://github.com/mdornseif/datastore-api/commit/7f5cd36821e670b989e858482b751b4e74f1d4ef))
* Moch-Datastore TS nags ([ee496be](https://github.com/mdornseif/datastore-api/commit/ee496be3b6fcf5fd3e574dde06dc3411e4facc75))
* recent version for npm ([1f7c044](https://github.com/mdornseif/datastore-api/commit/1f7c044af2994da2c167db46521a9ee7c1b8fccd))
* skip Tests with datastore-emulator ([f648718](https://github.com/mdornseif/datastore-api/commit/f6487189e3b9de912ad0b2b363b1a87e772b25e2))
* Version bump ([537fe03](https://github.com/mdornseif/datastore-api/commit/537fe03e39265854fd9e4125c85e5b8b0a757bb1))

## [4.0.0](https://github.com/mdornseif/datastore-api/compare/v2.0.1...v4.0.0) (2023-10-24)


### ⚠ BREAKING CHANGES

* if you relied on _keyStr in the Datastore.

### Features

* Add `Dstore.engine` identifier to allow debugging of nested stacks ([d5cba67](https://github.com/mdornseif/datastore-api/commit/d5cba6715a9e22e2cc5482347437f9b223be2c12))
* Do not save _keyStr to Datastore ([909a4c9](https://github.com/mdornseif/datastore-api/commit/909a4c91a0c43d15b7ca299796256839de7861f8))
* **docs:** Automatically Publish Documentation on new releases ([3cea768](https://github.com/mdornseif/datastore-api/commit/3cea76874e355a2f1df38d156d5d5cac264971c7))
* test against datastore-emulator ([65b000a](https://github.com/mdornseif/datastore-api/commit/65b000abe0f077c9220f377beb3003d33542975f))
* **Tests:** Test against the real cloud firestore / datastore ([8f28a4c](https://github.com/mdornseif/datastore-api/commit/8f28a4c23bdef1768be2732d37882030aff1d5ee))
* use @google-cloud/datastore 8.x PropertyFilter ([371da2a](https://github.com/mdornseif/datastore-api/commit/371da2a96712ffdf24bbc69e27acf2740078efbe))


### Bug Fixes

* **build:** export correct modules ([ff117b4](https://github.com/mdornseif/datastore-api/commit/ff117b42bc36585776d300e8cf84484a8838c633))
* bump version ([544c6ce](https://github.com/mdornseif/datastore-api/commit/544c6cef6ca5c6ee05f88e4914faaccaee3d7eca))
* **CI:** added missint `lint` target ([0e23765](https://github.com/mdornseif/datastore-api/commit/0e2376583c1ab5dbbaded31bcfc1800b4807eed6))
* **CI:** Google-Auth ([2357580](https://github.com/mdornseif/datastore-api/commit/23575803e608b005e0d9a5ae30c5f79b89b5e45e))
* **CI:** use changed action for gcloud ([a7a280f](https://github.com/mdornseif/datastore-api/commit/a7a280fc32890ea5f6df18cc5b3dd9b869445ec2))
* datastore.simulator handling queries without filters ([13bedcb](https://github.com/mdornseif/datastore-api/commit/13bedcb9869473af03806f2d8c33c69ce0095a82))
* **deps:** eslint ([0386f25](https://github.com/mdornseif/datastore-api/commit/0386f25f492a4b1d0aebd2b71a13437a51e3dad2))
* https://github.com/mdornseif/datastore-api/releases/tag/v2.1.0 ([80ec1b0](https://github.com/mdornseif/datastore-api/commit/80ec1b0a4254bd30c51e204163abaabf70a23415))
* lint ([7f5cd36](https://github.com/mdornseif/datastore-api/commit/7f5cd36821e670b989e858482b751b4e74f1d4ef))
* Moch-Datastore TS nags ([ee496be](https://github.com/mdornseif/datastore-api/commit/ee496be3b6fcf5fd3e574dde06dc3411e4facc75))
* recent version for npm ([1f7c044](https://github.com/mdornseif/datastore-api/commit/1f7c044af2994da2c167db46521a9ee7c1b8fccd))
* skip Tests with datastore-emulator ([f648718](https://github.com/mdornseif/datastore-api/commit/f6487189e3b9de912ad0b2b363b1a87e772b25e2))
* Version bump ([537fe03](https://github.com/mdornseif/datastore-api/commit/537fe03e39265854fd9e4125c85e5b8b0a757bb1))

## [4.0.0](https://github.com/mdornseif/datastore-api/compare/v2.0.1...v4.0.0) (2023-10-24)


### ⚠ BREAKING CHANGES

* if you relied on _keyStr in the Datastore.

### Features

* Add `Dstore.engine` identifier to allow debugging of nested stacks ([d5cba67](https://github.com/mdornseif/datastore-api/commit/d5cba6715a9e22e2cc5482347437f9b223be2c12))
* Do not save _keyStr to Datastore ([909a4c9](https://github.com/mdornseif/datastore-api/commit/909a4c91a0c43d15b7ca299796256839de7861f8))
* **docs:** Automatically Publish Documentation on new releases ([3cea768](https://github.com/mdornseif/datastore-api/commit/3cea76874e355a2f1df38d156d5d5cac264971c7))
* test against datastore-emulator ([65b000a](https://github.com/mdornseif/datastore-api/commit/65b000abe0f077c9220f377beb3003d33542975f))
* **Tests:** Test against the real cloud firestore / datastore ([8f28a4c](https://github.com/mdornseif/datastore-api/commit/8f28a4c23bdef1768be2732d37882030aff1d5ee))
* use @google-cloud/datastore 8.x PropertyFilter ([371da2a](https://github.com/mdornseif/datastore-api/commit/371da2a96712ffdf24bbc69e27acf2740078efbe))


### Bug Fixes

* **build:** export correct modules ([ff117b4](https://github.com/mdornseif/datastore-api/commit/ff117b42bc36585776d300e8cf84484a8838c633))
* bump version ([544c6ce](https://github.com/mdornseif/datastore-api/commit/544c6cef6ca5c6ee05f88e4914faaccaee3d7eca))
* **CI:** added missint `lint` target ([0e23765](https://github.com/mdornseif/datastore-api/commit/0e2376583c1ab5dbbaded31bcfc1800b4807eed6))
* **CI:** Google-Auth ([2357580](https://github.com/mdornseif/datastore-api/commit/23575803e608b005e0d9a5ae30c5f79b89b5e45e))
* **CI:** use changed action for gcloud ([a7a280f](https://github.com/mdornseif/datastore-api/commit/a7a280fc32890ea5f6df18cc5b3dd9b869445ec2))
* datastore.simulator handling queries without filters ([13bedcb](https://github.com/mdornseif/datastore-api/commit/13bedcb9869473af03806f2d8c33c69ce0095a82))
* **deps:** eslint ([0386f25](https://github.com/mdornseif/datastore-api/commit/0386f25f492a4b1d0aebd2b71a13437a51e3dad2))
* https://github.com/mdornseif/datastore-api/releases/tag/v2.1.0 ([80ec1b0](https://github.com/mdornseif/datastore-api/commit/80ec1b0a4254bd30c51e204163abaabf70a23415))
* lint ([7f5cd36](https://github.com/mdornseif/datastore-api/commit/7f5cd36821e670b989e858482b751b4e74f1d4ef))
* Moch-Datastore TS nags ([ee496be](https://github.com/mdornseif/datastore-api/commit/ee496be3b6fcf5fd3e574dde06dc3411e4facc75))
* recent version for npm ([1f7c044](https://github.com/mdornseif/datastore-api/commit/1f7c044af2994da2c167db46521a9ee7c1b8fccd))
* skip Tests with datastore-emulator ([f648718](https://github.com/mdornseif/datastore-api/commit/f6487189e3b9de912ad0b2b363b1a87e772b25e2))
* Version bump ([537fe03](https://github.com/mdornseif/datastore-api/commit/537fe03e39265854fd9e4125c85e5b8b0a757bb1))

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
