/*
 * dstore.ts - Datastore Compatibility layer
 * Try to get a smoother API for transactions and such.
 * A little bit inspired by the Python2 ndb interface.
 * But without the ORM bits.
 *
 * In future https://github.com/graphql/dataloader might be used for batching.
 *
 * Created by Dr. Maximillian Dornseif 2021-12-05 in huwawi3backend 11.10.0
 * Copyright (c) 2021, 2022, 2023, 2025 Dr. Maximillian Dornseif
 */

import { AsyncLocalStorage } from 'async_hooks'
import { setImmediate } from 'timers/promises'

import { Datastore, Key, PathType, Query, Transaction, PropertyFilter } from '@google-cloud/datastore'
import { Entity, entity } from '@google-cloud/datastore/build/src/entity'
import { Operator, RunQueryInfo, RunQueryResponse } from '@google-cloud/datastore/build/src/query'
import { CommitResponse } from '@google-cloud/datastore/build/src/request'
import {
  assert,
  assertIsArray,
  assertIsDefined,
  assertIsNumber,
  assertIsObject,
  assertIsString,
} from 'assertate-debug'
import Debug from 'debug'
import promClient from 'prom-client'
import { Writable } from 'ts-essentials'

/** @ignore */
export { Datastore, Key, PathType, Query, Transaction } from '@google-cloud/datastore'

/** @ignore */
const debug = Debug('ds:api')

/** @ignore */
const transactionAsyncLocalStorage = new AsyncLocalStorage()

// for HMR
promClient.register.removeSingleMetric('dstore_requests_seconds')
promClient.register.removeSingleMetric('dstore_failures_total')
/** @ignore */
const metricHistogram = new promClient.Histogram({
  name: 'dstore_requests_seconds',
  help: 'How long did Datastore operations take?',
  labelNames: ['operation'],
})
const metricFailureCounter = new promClient.Counter({
  name: 'dstore_failures_total',
  help: 'How many Datastore operations failed?',
  labelNames: ['operation'],
})

/** Use instead of Datastore.KEY
 *
 * Even better: use `_key` instead.
 */
export const KEYSYM = Datastore.KEY

export type IGqlFilterTypes = boolean | string | number

export type IGqlFilterSpec = {
  readonly eq: IGqlFilterTypes
}
export type TGqlFilterList = Array<[string, Operator, DstorePropertyValues]>

/** Define what can be written into the Datastore */
export type DstorePropertyValues =
  | number
  | string
  | Date
  | boolean
  | null
  | undefined
  | Buffer
  | Key
  | DstorePropertyValues[]
  | { [key: string]: DstorePropertyValues }

export interface IDstoreEntryWithoutKey {
  /** All User Data stored in the Datastore */
  [key: string]: DstorePropertyValues
}

/** Represents what is actually stored inside the Datastore, called "Entity" by Google
    [@google-cloud/datastore](https://github.com/googleapis/nodejs-datastore#readme) adds `[Datastore.KEY]`. Using ES6 Symbols presents all kinds of hurdles, especially when you try to serialize into a cache. So we add the property _keyStr which contains the encoded key. It is automatically used to reconstruct `[Datastore.KEY]`, if you use [[Dstore.readKey]].
*/
export interface IDstoreEntry extends IDstoreEntryWithoutKey {
  /* Datastore Key provided by [@google-cloud/datastore](https://github.com/googleapis/nodejs-datastore#readme) */
  readonly [Datastore.KEY]?: Key
  /** [Datastore.KEY] key */
  _keyStr: string
}

/** Represents the thing you pass to the save method. Also called "Entity" by Google */
export type DstoreSaveEntity = {
  key: Key
  data: Omit<IDstoreEntry, '_keyStr' | Datastore['KEY']> &
  Partial<{
    _keyStr: string | undefined;
    [Datastore.KEY]: Key
  }>
  method?: 'insert' | 'update' | 'upsert'
  excludeLargeProperties?: boolean
  excludeFromIndexes?: readonly string[]
}

export interface IIterateParams {
  kindName: string,
  filters?: TGqlFilterList,
  limit?: number,
  ordering?: readonly string[],
  selection?: readonly string[],
}
type IDstore = {
  /** Accessible by Users of the library. Keep in mind that you will access outside transactions created by [[runInTransaction]]. */
  readonly datastore: Datastore
  key: (path: ReadonlyArray<PathType>) => Key
  keyFromSerialized: (text: string) => Key
  keySerialize: (key: Key) => string
  readKey: (entry: IDstoreEntry) => Key
  get: (key: Key) => Promise<IDstoreEntry | null>
  getMulti: (keys: ReadonlyArray<Key>) => Promise<ReadonlyArray<IDstoreEntry | null>>
  set: (key: Key, entry: IDstoreEntry) => Promise<Key>
  save: (entities: readonly DstoreSaveEntity[]) => Promise<CommitResponse | undefined>
  insert: (entities: readonly DstoreSaveEntity[]) => Promise<CommitResponse | undefined>
  update: (entities: readonly DstoreSaveEntity[]) => Promise<CommitResponse | undefined>
  delete: (keys: readonly Key[]) => Promise<CommitResponse | undefined>
  createQuery: (kind: string) => Query
  runQuery: (query: Query | Omit<Query, 'run'>) => Promise<RunQueryResponse>
  query: (
    kind: string,
    filters?: TGqlFilterList,
    limit?: number,
    ordering?: readonly string[],
    selection?: readonly string[],
    cursor?: string
  ) => Promise<RunQueryResponse>
  iterate: (options: IIterateParams) => AsyncIterable<IDstoreEntry>
  allocateOneId: (kindName: string) => Promise<string>
  runInTransaction: <T>(func: { (): Promise<T>; (): T }) => Promise<T>
}

/** Dstore implements a slightly more accessible version of the [Google Cloud Datastore: Node.js Client](https://cloud.google.com/nodejs/docs/reference/datastore/latest)

[@google-cloud/datastore](https://github.com/googleapis/nodejs-datastore#readme) is a strange beast: [The documentation is auto generated](https://cloud.google.com/nodejs/docs/reference/datastore/latest) and completely shy of documenting any advanced concepts.
(Example: If you ask the datastore to auto-generate keys during save: how do you retrieve the generated key?) Generally I suggest to look at the Python 2.x [db](https://cloud.google.com/appengine/docs/standard/python/datastore/api-overview) and [ndb](https://cloud.google.com/appengine/docs/standard/python/ndb) documentation to get a better explanation of the workings of the datastore.

Also the typings are strange. The Google provided type `Entities` can be the on disk representation, the same but including a key reference (`Datastore.KEY` - [[IDstoreEntry]]), a list of these  or a structured object containing the on disk representation under the `data` property and a `key` property and maybe some configuration like `excludeFromIndexes` ([[DstoreSaveEntity]]) or a list of these.

KvStore tries to abstract away most surprises the datastore provides to you but als tries to stay as API compatible as possible to [@google-cloud/datastore](https://github.com/googleapis/nodejs-datastore).

Main differences:

- Everything asynchronous is Promise-based - no callbacks.
- [[get]] always returns a single [[IDstoreEntry]].
- [[getMulti]] always returns an Array<[[IDstoreEntry]]> of the same length as the input Array. Items not found are represented by null.
- [[set]] is called with `(key, value)` and always returns the complete [[Key]] of the entity being written. Keys are normalized, numeric IDs are always encoded as strings.
- [[key]] handles [[Key]] object instantiation for you.
- [[readKey]] extracts the key from an [[IDstoreEntry]] you have read without the need of fancy `Symbol`-based access to `entity[Datastore.KEY]`. If needed, it tries to deserialize `_keyStr` to create `entity[Datastore.KEY]`. This ist important when rehydrating an [[IDstoreEntry]] from a serializing cache.
- [[allocateOneId]] returns a single numeric string encoded unique datastore id without the need of fancy unpacking.
- [[runInTransaction]] allows you to provide a function to be executed inside an transaction without the need of passing around the transaction object. This is modelled after Python 2.7 [ndb's `@ndb.transactional` feature](https://cloud.google.com/appengine/docs/standard/python/ndb/transactions). This is implemented via node's [AsyncLocalStorage](https://nodejs.org/docs/latest-v14.x/api/async_hooks.html).
- [[keySerialize]] is synchronous.

This documentation also tries to document the little known idiosyncrasies of the [@google-cloud/datastore](https://github.com/googleapis/nodejs-datastore) library. See the corresponding functions.
*/
export class Dstore implements IDstore {
  engine = 'Dstore';
  engines: string[] = [];
  private readonly urlSaveKey = new entity.URLSafeKey();

  /** Generate a Dstore instance for a specific [[Datastore]] instance.

  ```
  const dstore = Dstore(new Datastore())
  ```

  You are encouraged to provide the second parameter to provide the ProjectID. This makes [[keySerialize]] more robust. Usually you can get this from the Environment:

  ```
  const dstore = Dstore(new Datastore(), process.env.GCLOUD_PROJECT)

  @param datastore A [[Datastore]] instance. Can be freely accessed by the client. Be aware that using this inside [[runInTransaction]] ignores the transaction.
  @param projectId The `GCLOUD_PROJECT ID`. Used for Key generation during serialization.
  ```
  */
  constructor(readonly datastore: Datastore, readonly projectId?: string, readonly logger?: string) {
    assertIsObject(datastore)
    this.engines.push(this.engine)
  }

  /** Gets the Datastore or the current Transaction. */
  private getDoT(): Transaction | Datastore {
    return (transactionAsyncLocalStorage.getStore() as Transaction) || this.datastore
  }

  /** `key()` creates a [[Key]] Object from a path.
   *
   * Compatible to [Datastore.key](https://cloud.google.com/nodejs/docs/reference/datastore/latest/datastore/datastore#_google_cloud_datastore_Datastore_key_member_1_)
   *
   * If the Path has an odd number of elements, it is considered an incomplete Key. This can only be used for saving and will prompt the Datastore to auto-generate an (random) ID. See also [[save]].
   *
   * @category Datastore Drop-In
   */
  key(path: readonly PathType[]): Key {
    return this.datastore.key(path as Writable<typeof path>)
  }

  /** `keyFromSerialized()` serializes [[Key]] to a string.
   *
   * Compatible to [keyToLegacyUrlSafe](https://cloud.google.com/nodejs/docs/reference/datastore/latest/datastore/datastore#_google_cloud_datastore_Datastore_keyToLegacyUrlSafe_member_1_), but does not support the "locationPrefix" since the use for this parameter is undocumented and unknown. It seems to be an artifact from early App Engine days.
   *
   * It can be a synchronous function because it does not look up the `projectId`. Instead it is assumed, that you give the `projectId` upon instantiation of [[Dstore]]. It also seems, that a wrong `projectId` bears no ill effects.
   *
   * @category Datastore Drop-In
   */
  keySerialize(key: Key): string {
    return key ? this.urlSaveKey.legacyEncode(this.projectId ?? '', key) : ''
  }

  /** `keyFromSerialized()` deserializes a string created with [[keySerialize]] to a [[Key]].
   *
   * Compatible to [keyFromLegacyUrlsafe](https://cloud.google.com/nodejs/docs/reference/datastore/latest/datastore/datastore#_google_cloud_datastore_Datastore_keyFromLegacyUrlsafe_member_1_).
   *
   * @category Datastore Drop-In
   */
  keyFromSerialized(text: string): Key {
    return this.urlSaveKey.legacyDecode(text)
  }

  /** `readKey()` extracts the [[Key]] from an [[IDstoreEntry]].
   *
   * Is is an alternative to `entity[Datastore.KEY]` which tends to fail in various contexts and also confuses older Typescript compilers.
   * It can extract the [[Key]] form a [[IDstoreEntry]] which has been serialized to JSON by leveraging the property `_keyStr`.
   *
   * @category Additional
   */
  readKey(ent: IDstoreEntry): Key {
    assertIsObject(ent)
    let ret = ent[Datastore.KEY]
    if (ent._keyStr && !ret) {
      ret = this.keyFromSerialized(ent._keyStr)
    }
    assertIsObject(
      ret,
      'entity[Datastore.KEY]/entity._keyStr',
      `Entity is missing the datastore Key: ${JSON.stringify(ent)}`
    )
    return ret
  }

  /** `fixKeys()` is called for all [[IDstoreEntry]] returned from [[Dstore]].
   *
   * Is ensures that besides `entity[Datastore.KEY]` there is `_keyStr` to be leveraged by [[readKey]].
   *
   * @internal
   */
  private fixKeys(
    entities: ReadonlyArray<Partial<IDstoreEntry> | undefined>
  ): Array<IDstoreEntry | undefined> {
    entities.forEach((x) => {
      if (!!x?.[Datastore.KEY] && x[Datastore.KEY]) {
        assertIsDefined(x[Datastore.KEY])
        assertIsObject(x[Datastore.KEY])
        // Old TypesScript has problems with symbols as a property
        x._keyStr = this.keySerialize(x[Datastore.KEY] as Key)
      }
    })
    return entities as Array<IDstoreEntry | undefined>
  }

  /** this is for save, insert, update and upsert  and ensures _kkeyStr() handling.
   * 
   */
  private prepareEntitiesForDatastore(entities: readonly DstoreSaveEntity[]) {
    for (const e of entities) {
      assertIsObject(e.key)
      assertIsObject(e.data)
      this.fixKeys([e.data])
      e.excludeLargeProperties = e.excludeLargeProperties === undefined ? true : e.excludeLargeProperties
      e.data = { ...e.data, _keyStr: undefined }
    }
  }

  /** this is for save, insert, update and upsert  and ensures _kkeyStr() handling.
   * 
   */
  private prepareEntitiesFromDatastore(entities: readonly DstoreSaveEntity[] & unknown[]) {
    for (const e of entities) {
      e.data[Datastore.KEY] = e.key
      this.fixKeys([e.data])
    }
  }

  /** `get()` reads a [[IDstoreEntry]] from the Datastore.
   *
   * It returns [[IDstoreEntry]] or `null` if not found.

   * The underlying Datastore API Call is [lookup](https://cloud.google.com/datastore/docs/reference/data/rest/v1/projects/lookup).
   *
   * It is in the Spirit of [Datastore.get()]. Unfortunately currently (late 2021) there is no formal documentation from Google on [Datastore.get()].
   *
   * Differences between [[Dstore.get]] and [[Datastore.get]]:
   *
   * - [Dstore.get]] takes a single [[Key]] as Parameter, no Array. Check [[getMulti]] if you want Arrays.
   * - [Dstore.get]] returns a single [[IDstoreEntry]], no Array.
   *
   * @category Datastore Drop-In
   */
  async get(key: Key): Promise<IDstoreEntry | null> {
    assertIsObject(key)
    assert(!Array.isArray(key))
    assert(key.path.length % 2 == 0, `key.path must be complete: ${JSON.stringify(key.path)}`)
    const result = await this.getMulti([key])
    return result?.[0] || null
  }

  /** `getMulti()` reads several [[IDstoreEntry]]s from the Datastore.
   *
   * It returns a list of [[IDstoreEntry]]s or `undefined` if not found. Entries are in the same Order as the keys in the Parameter.
   * This is different from the @google-cloud/datastore where not found items are not present in the result and the order in the result list is undefined.
   *
   * The underlying Datastore API Call is [lookup](https://cloud.google.com/datastore/docs/reference/data/rest/v1/projects/lookup).
   *
   * It is in the Spirit of [Datastore.get()]. Unfortunately currently (late 2021) there is no formal documentation from Google on [Datastore.get()].
   *
   * Differences between [[Dstore.getMulti]] and [[Datastore.get]]:
   *
   * - [[Dstore.getMulti]] always takes an Array of [[Key]]s as Parameter.
   * - [[Dstore.getMulti]] returns always a Array of [[IDstoreEntry]], or null.
   * - [[Datastore.get]] has many edge cases - e.g. when not being able to find any of the provided keys - which return surprising results. [[Dstore.getMulti]] always returns an Array. TODO: return a Array with the same length as the Input.
   *
   * @category Datastore Drop-In
   */
  async getMulti(keys: readonly Key[]): Promise<Array<IDstoreEntry | null>> {
    // assertIsArray(keys);
    let results: (IDstoreEntry | null | undefined)[]
    const metricEnd = metricHistogram.startTimer()
    try {
      results = this.fixKeys(
        keys.length > 0 ? (await this.getDoT().get(keys as Writable<typeof keys>))?.[0] : []
      )
    } catch (error) {
      metricFailureCounter.inc({ operation: 'get' })
      await setImmediate()
      throw new DstoreError('datastore.getMulti error', error as Error, { keys })
    } finally {
      metricEnd({ operation: 'get' })
    }

    // Sort resulting entities by the keys they were requested with.
    assertIsArray(results)
    const entities = results as IDstoreEntry[]
    const entitiesByKey: Record<string, IDstoreEntry> = {}
    entities.forEach((entity) => {
      entitiesByKey[JSON.stringify(entity[Datastore.KEY])] = entity
    })
    return keys.map((key) => entitiesByKey[JSON.stringify(key)] || null)
  }

  /** `set()` is addition to [[Datastore]]. It provides a classic Key-value Interface.
   *
   * Instead providing a nested [[DstoreSaveEntity]] to [[save]] you can call set directly as `set( key, value)`.
   * Observe that set takes a [[Key]] as first parameter. you call it like this;
   *
   * ```js
   * const ds = Dstore()
   * ds.set(ds.key('kind', '123'), {props1: 'foo', prop2: 'bar'})
   * ```
   *
   * It returns the [[Key]] of the Object being written.
   * If the Key provided was an incomplete [[Key]] it will return a completed [[Key]].
   * See [[save]] for more information on key generation.
   *
   * @category Additional
   */
  async set(key: Key, data: IDstoreEntryWithoutKey): Promise<Key> {
    assertIsObject(key)
    assertIsObject(data)
    const saveEntity = { key, data: { ...data, _keyStr: undefined } }
    await this.save([saveEntity])
    return saveEntity.key
  }

  /** `save()` is compatible to [Datastore.save()](https://cloud.google.com/nodejs/docs/reference/datastore/latest/datastore/datastore#_google_cloud_datastore_Datastore_save_member_1_).
   *
   * The single Parameter is a list of [[DstoreSaveEntity]]s.
   * If called within a transaction it returns `undefined`.
   * If not, it returns a [[CommitResponse]] which is not documented by Google.
   *
   * Different [DstoreSaveEntity]]s in the `entities` parameter can have different values in their [[DstoreSaveEntity.method]] property.
   * This allows you to do `insert`, `update` and `upsert` (the default) in a single request.
   *
   * `save()` seems to basically be an alias to [upsert](https://cloud.google.com/nodejs/docs/reference/datastore/latest/datastore/datastore#_google_cloud_datastore_Datastore_upsert_member_1_).
   *
   * If the [[Key]] provided in [[DstoreSaveEntity.key]] was an incomplete [[Key]] it will be updated by `save()` inside the [[DstoreSaveEntity]].
   *
   * If the Datastore generates a new ID because of an incomplete [[Key]] *on first save* it will return an large integer as [[Key.id]].
   * On every subsequent `save()` an string encoded number representation is returned.
   * @todo Dstore should normalizes that and always return an string encoded number representation.
   *
   * Each [[DstoreSaveEntity]] can have an `excludeFromIndexes` property which is somewhat underdocumented.
   * It can use something like JSON-Path notation
   * ([Source](https://github.com/googleapis/nodejs-datastore/blob/2941f2f0f132b41534e303d441d837051ce88fd7/src/index.ts#L948))
   * [.*](https://github.com/googleapis/nodejs-datastore/blob/406b15d2014087172df617c6e0a397a2c0902c5f/test/index.ts#L1598),
   * [parent[]](https://github.com/googleapis/nodejs-datastore/blob/406b15d2014087172df617c6e0a397a2c0902c5f/test/index.ts#L1672),
   * [parent.*](https://github.com/googleapis/nodejs-datastore/blob/406b15d2014087172df617c6e0a397a2c0902c5f/test/index.ts#L1672),
   * [parent[].*](https://github.com/googleapis/nodejs-datastore/blob/406b15d2014087172df617c6e0a397a2c0902c5f/test/index.ts#L1672)
   * and [more complex patterns](https://github.com/googleapis/nodejs-datastore/blob/406b15d2014087172df617c6e0a397a2c0902c5f/test/index.ts#L1754)
   * seem to be supported patterns.
   *
   * If the caller has not provided an `excludeLargeProperties` in a [[DstoreSaveEntity]] we will default it
   * to `excludeLargeProperties: true`. Without this you can not store strings longer than 1500 bytes easily
   * ([source](https://github.com/googleapis/nodejs-datastore/blob/c7a08a8382c6706ccbfbbf77950babf40bac757c/src/entity.ts#L961)).
   *
   * @category Datastore Drop-In
   */
  async save(entities: readonly DstoreSaveEntity[]): Promise<CommitResponse | undefined> {
    assertIsArray(entities)
    let ret: CommitResponse | undefined
    const metricEnd = metricHistogram.startTimer()
    try {
      this.prepareEntitiesForDatastore(entities)
      // Within Transaction we don't get any answer here!
      // [ { mutationResults: [ [Object], [Object] ], indexUpdates: 51 } ]
      ret = (await this.getDoT().save(entities)) || undefined
      this.prepareEntitiesFromDatastore(entities)
    } catch (error) {
      metricFailureCounter.inc({ operation: 'save' })
      await setImmediate()
      throw new DstoreError('datastore.save error', error as Error)
    } finally {
      metricEnd({ operation: 'save' })
    }
    return ret
  }



  /** `insert()` is compatible to [Datastore.insert()](https://cloud.google.com/nodejs/docs/reference/datastore/latest/datastore/datastore#_google_cloud_datastore_Datastore_insert_member_1_).
   *
   * The single Parameter is a list of [[DstoreSaveEntity]]s.
   * If called within a transaction it returns `undefined`.
   * If not, it returns a [[CommitResponse]] which is not documented by Google.
   *
   * `insert()` seems to be like [[save]] where [[DstoreSaveEntity.method]] is set to `'insert'`. It throws an [[DstoreError]] if there is already a Entity with the same [[Key]] in the Datastore.
   *
   * For handling of incomplete [[Key]]s see [[save]].
   *
   * This function can be completely emulated by using [[save]] with `method: 'insert'` inside each [[DstoreSaveEntity]].
   * Prefer using `save()` because it is much better tested.
   *
   *     await ds.insert([{key: ds.key(['testKind', 123]), entity: {data:' 123'}}])
   *
   * @throws [[DstoreError]]
   * @category Datastore Drop-In
   */
  async insert(entities: readonly DstoreSaveEntity[]): Promise<CommitResponse | undefined> {
    assertIsArray(entities)
    let ret: CommitResponse | undefined
    const metricEnd = metricHistogram.startTimer()
    try {
      this.prepareEntitiesForDatastore(entities)
      ret = (await this.getDoT().insert(entities)) || undefined
      this.prepareEntitiesFromDatastore(entities)
    } catch (error) {
      // console.error(error)
      metricFailureCounter.inc({ operation: 'insert' })
      await setImmediate()
      throw new DstoreError('datastore.insert error', error as Error)
    } finally {
      metricEnd({ operation: 'insert' })
    }
    return ret
  }

  /** `update()` is compatible to [Datastore.update()](https://cloud.google.com/nodejs/docs/reference/datastore/latest/datastore/datastore#_google_cloud_datastore_Datastore_update_member_1_).

   * The single Parameter is a list of [[DstoreSaveEntity]]s.
   * If called within a transaction it returns `undefined`.
   * If not, it returns a [[CommitResponse]] which is not documented by Google.
   *
   * `update()` seems to be like [[save]] where [[DstoreSaveEntity.method]] is set to `'update'`.
   * It throws an [[DstoreError]] if there is no Entity with the same [[Key]] in the Datastore. `update()` *overwrites all existing data* for that [[Key]].
   * There was an alpha functionality called `merge()` in the Datastore which read an Entity, merged it with the new data and wrote it back, but this was never documented.
   *
   * `update()` is idempotent. Updating the same [[Key]] twice is no error.
   *
   * This function can be completely emulated by using [[save]] with `method: 'update'` inside each [[DstoreSaveEntity]].
   * Prefer using `save()` because it is much better tested.
   *
   * @throws [[DstoreError]]
   * @category Datastore Drop-In
   */
  async update(entities: readonly DstoreSaveEntity[]): Promise<CommitResponse | undefined> {
    assertIsArray(entities)

    entities.forEach((entity) => assertIsObject(entity.key))
    entities.forEach((entity) =>
      assert(
        entity.key.path.length % 2 == 0,
        `entity.key.path must be complete: ${JSON.stringify([entity.key.path, entity])}`
      )
    )
    let ret: CommitResponse | undefined
    const metricEnd = metricHistogram.startTimer()

    try {
      this.prepareEntitiesForDatastore(entities)
      ret = (await this.getDoT().update(entities)) || undefined
      this.prepareEntitiesFromDatastore(entities)
    } catch (error) {
      // console.error(error)
      metricFailureCounter.inc({ operation: 'update' })
      await setImmediate()
      throw new DstoreError('datastore.update error', error as Error)
    } finally {
      metricEnd({ operation: 'update' })
    }
    return ret
  }

  /** `delete()` is compatible to [Datastore.delete()].
   *
   * Unfortunately currently (late 2021) there is no formal documentation from Google on [Datastore.delete()].
   *
   * The single Parameter is a list of [[Key]]s.
   * If called within a transaction it returns `undefined`.
   * If not, it returns a [[CommitResponse]] which is not documented by Google.
   *
   * `delete()` is idempotent. Deleting the same [[Key]] twice is no error.
   *
   * @throws [[DstoreError]]
   * @category Datastore Drop-In
   */
  async delete(keys: readonly Key[]): Promise<CommitResponse | undefined> {
    assertIsArray(keys)
    keys.forEach((key) => assertIsObject(key))
    keys.forEach((key) =>
      assert(key.path.length % 2 == 0, `key.path must be complete: ${JSON.stringify(key.path)}`)
    )
    let ret
    const metricEnd = metricHistogram.startTimer()
    try {
      ret = (await this.getDoT().delete(keys)) || undefined
    } catch (error) {
      metricFailureCounter.inc({ operation: 'delete' })
      await setImmediate()
      throw new DstoreError('datastore.delete error', error as Error)
    } finally {
      metricEnd({ operation: 'delete' })
    }
    return ret
  }

  /** `createQuery()` creates an "empty" [[Query]] Object.
   *
   * Compatible to [createQuery](https://cloud.google.com/nodejs/docs/reference/datastore/latest/datastore/datastore#_google_cloud_datastore_Datastore_createQuery_member_1_) in the datastore.
   *
   * @param kindName Name of the [[Datastore]][Kind](https://cloud.google.com/datastore/docs/concepts/entities#kinds_and_identifiers) ("Table") which should be searched.
   *
   * @category Datastore Drop-In
   */
  createQuery(kindName: string): Query {
    try {
      return this.getDoT().createQuery(kindName)
    } catch (error) {
      throw new DstoreError('datastore.createQuery error', error as Error)
    }
  }

  async runQuery(query: Query | Omit<Query, 'run'>): Promise<RunQueryResponse> {
    let ret
    const metricEnd = metricHistogram.startTimer()
    try {
      const [entities, info]: [Entity[], RunQueryInfo] = await this.getDoT().runQuery(query as Query)
      ret = [this.fixKeys(entities), info]
    } catch (error) {
      await setImmediate()
      throw new DstoreError('datastore.runQuery error', error as Error)
    } finally {
      metricEnd({ operation: 'query' })
    }
    return ret as RunQueryResponse
  }

  /** `query()` combined [[createQuery]] and [[runQuery]] in a single call.
   *
   *
   * @param kindName Name of the [[Datastore]][Kind](https://cloud.google.com/datastore/docs/concepts/entities#kinds_and_identifiers) ("Table") which should be searched.
   * @param filters List of [[Query]] filter() calls.
   * @param limit Maximum Number of Results to return.
   * @param ordering List of [[Query]] order() calls.
   * @param selection selectionList of [[Query]] select() calls.
   * @param cursor unsupported so far.
   *
   * @throws [[DstoreError]]
   * @category Datastore Drop-In
   * @deprecated Use [[iterate]] instead.
   */
  async query(
    kindName: string,
    filters: TGqlFilterList = [],
    limit = 2500,
    ordering: readonly string[] = [],
    selection: readonly string[] = [],
    cursor?: string
  ): Promise<RunQueryResponse> {
    assertIsString(kindName)
    assertIsArray(filters)
    assertIsNumber(limit)
    try {
      const q = this.createQuery(kindName)
      for (const filterSpec of filters) {
        assertIsObject(filterSpec)
        // @ts-ignore
        q.filter(new PropertyFilter(...filterSpec))
      }
      for (const orderField of ordering) {
        q.order(orderField)
      }
      if (limit > 0) {
        q.limit(limit)
      }
      if (selection.length > 0) {
        q.select(selection as any)
      }
      return await this.getDoT().runQuery(q)
    } catch (error) {
      await setImmediate()
      throw new DstoreError('datastore.query error', error as Error, {
        kindName,
        filters,
        limit,
        ordering,
      })
    }
  }


  /** `iterate()` is a modernized version of `query()`.
   *
   * It takes a Parameter object and returns an AsyncIterable.
   * Entities returned have been processed by `fixKeys()`.
   * 
   * Can be used with `for await` loops like this:
   * 
   * ```typescript
   * for await (const entity of dstore.iterate({ kindName: 'p_ReservierungsAbruf', filters: [['verbucht', '=', true]]})) {
   *   console.log(entity)
   * }
   * ```
   * 
   * @param kindName Name of the [[Datastore]][Kind](https://cloud.google.com/datastore/docs/concepts/entities#kinds_and_identifiers) ("Table") which should be searched.
   * @param filters List of [[Query]] filter() calls.
   * @param limit Maximum Number of Results to return.
   * @param ordering List of [[Query]] order() calls.
   * @param selection selectionList of [[Query]] select() calls.
   *
   * @throws [[DstoreError]]
   * @category Additional
   */
  async * iterate({
    kindName,
    filters = [],
    limit = 2500,
    ordering = [],
    selection = [],
  }: IIterateParams): AsyncIterable<IDstoreEntry> {
    assertIsString(kindName)
    assertIsArray(filters)
    assertIsNumber(limit)
    try {
      const q = this.getDoT().createQuery(kindName)
      for (const filterSpec of filters) {
        assertIsObject(filterSpec)
        // @ts-ignore
        q.filter(new PropertyFilter(...filterSpec))
      }
      for (const orderField of ordering) {
        q.order(orderField)
      }
      if (limit > 0) {
        q.limit(limit)
      }
      if (selection.length > 0) {
        q.select(selection as any)
      }
      for await (const entity of q.runStream()) {
        const ret = this.fixKeys([entity])[0]
        assertIsDefined(ret, 'datastore.iterate: entity is undefined')
        yield ret
      }
    } catch (error) {
      await setImmediate()
      throw new DstoreError('datastore.query error', error as Error, {
        kindName,
        filters,
        limit,
        ordering,
      })
    }
  }

  /** Allocate one ID in the Datastore.
   *
   * Currently (late 2021) there is no documentation provided by Google for the underlying node function.
   * Check the Documentation for [the low-level function](https://cloud.google.com/datastore/docs/reference/data/rest/v1/projects/allocateIds)
   * and [the conceptual overview](https://cloud.google.com/datastore/docs/concepts/entities#assigning_your_own_numeric_id)
   * and [this Stackoverflow post](https://stackoverflow.com/questions/60516959/how-does-allocateids-work-in-cloud-datastore-mode).
   *
   * The ID is a string encoded large number. This function will never return the same ID twice for any given Datastore.
   * If you provide a kindName the ID will be namespaced to this kind.
   * In fact the generated ID is namespaced via an incomplete [[Key]] of the given Kind.
   */
  async allocateOneId(kindName = 'Numbering'): Promise<string> {
    assertIsString(kindName)
    const ret = (await this.datastore.allocateIds(this.key([kindName]), 1))[0][0].id
    assertIsString(ret)
    return ret
  }

  /** This tries to give high level access to transactions.

    So called "Gross Group Transactions" are always enabled. Transactions are never Cross Project. `runInTransaction()` works only if you use the same [[KvStore] instance for all access within the Transaction.

    [[runInTransaction]] is modelled after Python 2.7 [ndb's `@ndb.transactional` feature](https://cloud.google.com/appengine/docs/standard/python/ndb/transactions). This is based on node's [AsyncLocalStorage](https://nodejs.org/docs/latest-v14.x/api/async_hooks.html).

    Transactions frequently fail if you try to access the same data via in a transaction. See the [Documentation on Locking](https://cloud.google.com/datastore/docs/concepts/transactions#transaction_locks) for further reference. You are advised to use [p-limit](https://github.com/sindresorhus/p-limit)(1) to serialize transactions touching the same resource. This should work nicely with node's single process model. It is a much bigger problem on shared-nothing approaches, like Python on App Engine.

    Transactions might be wrapped in [p-retry](https://github.com/sindresorhus/p-retry) to implement automatically retrying them with exponential back-off should they fail due to contention.

    Be aware that Transactions differ considerable between Master-Slave Datastore (very old), High Replication Datastore (old, later called [Google Cloud Datastore](https://cloud.google.com/datastore/docs/concepts/cloud-datastore-transactions)) and [Firestore in Datastore Mode](https://cloud.google.com/datastore/docs/firestore-or-datastore#in_datastore_mode) (current).

    Most Applications today are running on "Firestore in Datastore Mode". Beware that the Datastore-Emulator fails with `error: 3 INVALID_ARGUMENT: Only ancestor queries are allowed inside transactions.` during [[runQuery]] while the Datastore on Google Infrastructure does not have such an restriction anymore as of 2022.
    */
  async runInTransaction<T>(func: () => Promise<T>): Promise<T> {
    let ret
    const transaction: Transaction = this.datastore.transaction()
    await transactionAsyncLocalStorage.run(transaction, async () => {
      const [transactionInfo, transactionRunApiResponse] = await transaction.run()
      let commitApiResponse
      try {
        ret = await func()
      } catch (error) {
        const rollbackInfo = await transaction.rollback()
        debug(
          'Transaction failed, rollback initiated: %O  %O %O %O',
          transactionInfo,
          transactionRunApiResponse,
          rollbackInfo,
          error
        )
        await setImmediate()
        throw new DstoreError('datastore.transaction execution error', error as Error)
      }
      try {
        commitApiResponse = (await transaction.commit())[0]
      } catch (error) {
        debug(
          'Transaction commit failed: %O %O %O %O ret: %O',
          transactionInfo,
          transactionRunApiResponse,
          commitApiResponse,
          error,
          ret
        )
        await setImmediate()
        throw new DstoreError('datastore.transaction execution error', error as Error)
      }
    })
    return ret as T
  }
}

export class DstoreError extends Error {
  public readonly extensions: Record<string, unknown>
  public readonly originalError: Error | undefined
  readonly [key: string]: unknown

  constructor(message: string, originalError: Error | undefined, extensions?: Record<string, unknown>) {
    super(`${message}: ${originalError?.message}`)

    // if no name provided, use the default. defineProperty ensures that it stays non-enumerable
    if (!this.name) {
      Object.defineProperty(this, 'name', { value: 'DstoreError' })
    }
    // metadata: Metadata { internalRepr: Map(0) {}, options: {} },
    this.originalError = originalError
    this.extensions = { ...extensions }
    this.stack =
      (this.stack?.split('\n')[0] || '') +
      '\n' +
      (originalError?.stack?.split('\n')?.slice(1)?.join('\n') || '') +
      '\n' +
      (this.stack?.split('\n')?.slice(1)?.join('\n') || '')

    // These are usually present on Datastore Errors
    // logger.error({ err: originalError, extensions }, message);
  }
}
