[![version](https://img.shields.io/npm/v/datastore-api.svg?style=flat-square)](https://npmjs.org/datastore-api)
[![license](https://img.shields.io/npm/l/datastore-api?color=%23007a1f&style=flat-square)](https://github.com/mdornseif/datastore-api/blob/master/LICENSE)
[![downloads](https://img.shields.io/npm/dm/datastore-api?style=flat-square&color=%23007a1f)](https://npmcharts.com/compare/datastore-api)

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
- Starting your code with the environment variable `DEBUG='ds:api'` allows you to trace API calls.

Find the full documentation [here](https://mdornseif.github.io/datastore-api/classes/Dstore.html). In there also some of the idiosyncrasies of using the Datastore are explained.

See [the API documentation](http://mdornseif.github.io/datastore-api/classes/Dstore.html) for Details, [Github](https://github.com/mdornseif/datastore-api) for source.

## Major issues

- The Javascript-Datastore Bindings use nanosecond-Timestamp Information stored in the Datasore and rounds it to milliseconds. Python at least retains microseconds.
- the old `get_entity_group_version()` / `getEntityGroupVersion()` API has been retired. You can still for `key` query `{ path: [key.path[0], {'kind': '__entity_group__', 'id': 1}]}` to get a `__version__` property. The reliability of this data on FireStore is unknown.
- Googles Javascript API decided to use `[Symbol(KEY)]` to represent the Key in an entity. This results in all kinds of confusion when serializing to JSON, e.g. for caching. This library adds the property `_keyStr` which will be transparently used to regenerate `[Symbol(KEY)]` when needed.
- Many functions are somewhat polymorphic where the shape of the return value depends on the function parameters, e.g. if the API was called with a key or a list of keys. You are encouraged to alvais provide a list of parameters instead a single parameter, e.g. `get([key])`  instead of `get(key)`.
- `insert()` and `save()` sometimes return the key being written and sometimes not. So you might or might not get some data in `insertResponse?.[0].mutationResults?.[0]?.key?.path` - urgs.
- Google avoids [BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt). So `key.id` is (usually but not always) returned as a String but you have to provide a Number to the API.

## Metrics

Datastore-API is instrumented with [prom-client](https://github.com/siimon/prom-client). Metrics are all prefixed with `dstore_`.

In an express based Application you can make them available like this:

```js
import promClient from 'prom-client';

server.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', promClient.register.contentType);
    res.end(await promClient.register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
});
```

## See also

- Google Documentation

  - [Official Google Node Datastore SDK Documentation](https://cloud.google.com/nodejs/docs/reference/datastore/latest)
  - [Hidden Auto-Generated Datastore API Documentation](https://cloud.google.com/nodejs/docs/reference/datastore/latest/datastore/datastore)
  - Other [Hidden Auto-Generated Datastore API Documentation](https://googleapis.dev/nodejs/datastore/latest/) with better navigation. Seems to contain more on the lower level access.
  - [SDK Source](https://github.com/googleapis/nodejs-datastore)
  - [API reference](https://cloud.google.com/datastore/docs/reference/data/rpc) helps to understand under-documented SDK.
  - [grpc-js environment variables](https://github.com/grpc/grpc-node/blob/master/doc/environment_variables.md) - try [GRPC_VERBOSITY=DEBUG GRPC_TRACE=all yarn test](https://github.com/grpc/grpc-node/blob/master/TROUBLESHOOTING.md)

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
