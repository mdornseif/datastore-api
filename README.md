# datastore-api

Simplified, more consistent API for Google Cloud Datastore.

Dstore implements a slightly more accessible version of the [Google Cloud Datastore: Node.js Client](https://cloud.google.com/nodejs/docs/reference/datastore/latest)

[@google-cloud/datastore](https://github.com/googleapis/nodejs-datastore#readme) is a strange beast: [The documentation is auto generated](https://cloud.google.com/nodejs/docs/reference/datastore/latest) missing some core methods and completely shy of documenting any advanced concepts.

Also the typings are strange and overly broad.

Dstore tries to abstract away most surprises the datastore provides to you but als tries to stay as API compatible as possible to [@google-cloud/datastore](https://github.com/googleapis/nodejs-datastore).

Main differences:

- Everything asynchronous is Promise-based - no callbacks.
- [get](http://mdornseif.io/datastore-api/classes/Dstore.html#get) always returns a single `DstoreEntry`.
- [getMulti](http://mdornseif.io/datastore-api/classes/Dstore.html#getMulti) always returns an Array.
- [set](http://mdornseif.io/datastore-api/classes/Dstore.html#set) is called with `(key, value)` and always returns the complete `Key` of the entity being written.
- [allocateOneId](http://mdornseif.io/datastore-api/classes/Dstore.html#allocateOneId) returns a single numeric string encoded unique datastore id without the need of fancy unpacking.
- [runInTransaction](http://mdornseif.io/datastore-api/classes/Dstore.html#runInTransaction) allows you to provide a function to be executed inside an transaction without the need of passing around the transaction object. This is modelled after Python 2.7 [ndb's `@ndb.transactional` feature](https://cloud.google.com/appengine/docs/standard/python/ndb/transactions). This is implemented via node's [AsyncLocalStorage](https://nodejs.org/docs/latest-v14.x/api/async_hooks.html).
- [keySerialize](http://mdornseif.io/datastore-api/classes/Dstore.html#keySerialize) is synchronous. 🦄

Find the full documentation [here](http://mdornseif.io/datastore-api/classes/Dstore.html). In there also some of the idiosyncrasies of using the Datastore are explained.

See [the API documentation](http://mdornseif.io/datastore-api/classes/Dstore.html) for Details.

## See also

- Google Documentation

  - [Official Google Node Datastore SDK Documentation](https://cloud.google.com/nodejs/docs/reference/datastore/latest)
  - [Hidden Auto-Generated Datastore API Documentation](https://cloud.google.com/nodejs/docs/reference/datastore/latest/datastore/datastore)
  - Other [Hidden Auto-Generated Datastore API Documentation](https://googleapis.dev/nodejs/datastore/latest/) with better navigation. Seems to contain more on the lower level access.
  - [SDK Source](https://github.com/googleapis/nodejs-datastore)
  - [API reference](https://cloud.google.com/datastore/docs/reference/data/rpc) helps to understand under-documented SDK.
  - [grpc-js environment variables](https://github.com/grpc/grpc-node/blob/master/doc/environment_variables.md) - try[GRPC_VERBOSITY=DEBUG GRPC_TRACE=all yarn test](https://github.com/grpc/grpc-node/blob/master/TROUBLESHOOTING.md)

- API Simplification
  - [google-cloud-datastore-node](https://www.npmjs.com/package/google-cloud-datastore-node)
  - [google_entity](https://github.com/aminekun90/google_entity)
  - [nodebjectify](https://github.com/Thomas-T/nodebjectify)
- ORM / Schema
  - [pebblebed](https://www.npmjs.com/package/pebblebed)
  - [gstore-node](https://github.com/sebelga/gstore-node)
- Others
  - [google-cloud-kvstore](https://www.npmjs.com/package/google-cloud-kvstore)
  - [datastore-entity](https://github.com/aubrian-halili/datastore-entity#readme)
