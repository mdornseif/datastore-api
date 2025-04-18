/*
 * dstore-api-cloud.test.ts - Test again the real Datastore.
 *
 * Created by Dr. Maximilian Dornseif 2021-12-10 in huwawi3backend 11.10.0
 * Copyright (c) 2021, 2023 Dr. Maximilian Dornseif
 */
// @ts-nocheck
import { Datastore, Key } from '@google-cloud/datastore'
import { assert, describe, expect, test } from 'vitest'

import { Dstore } from './dstore-api'

function getDstore() {
  return new Dstore(new Datastore({ namespace: 'test', projectId: 'hdmashup-hrd' }))
}

test('keySerialize', async () => {
  const kvStore = getDstore()
  assert.deepEqual(kvStore.key(['testYodel', 123]).path, ['testYodel', 123])
  assert.deepEqual(JSON.parse(JSON.stringify(kvStore.key(['testYodel', 123]))), {
    id: 123 as any, // typing in inconclusive here
    kind: 'testYodel',
    namespace: 'test',
    path: ['testYodel', 123],
  } as any)
  const ser = kvStore.keySerialize(kvStore.key(['testYodel', 123]))
  expect(ser).toMatchInlineSnapshot('"agByDwsSCXRlc3RZb2RlbBh7DKIBBHRlc3Q"')
  expect(JSON.parse(JSON.stringify(kvStore.keyFromSerialized(ser)))).toMatchInlineSnapshot(`
    {
      "id": "123",
      "kind": "testYodel",
      "namespace": "test",
      "path": [
        "testYodel",
        "123",
      ],
    }
  `)
})

describe('Allocation', () => {
  test('allocateIds', async () => {
    const kvStore = getDstore()
    const keys = await kvStore.datastore.allocateIds(kvStore.datastore.key(['testYodel']), 2)
    expect(Array.isArray(keys)).toBeTruthy()
    expect(keys[0].length).toBe(2)
    expect(keys[0][0].kind).toBe('testYodel')
    expect(keys[0][0].id).toMatch(/\d+/)
    expect(keys?.[1]?.keys?.length).toBe(2)
    expect(keys[1].keys[0].partitionId.namespaceId).toMatchInlineSnapshot('"test"')
    expect(keys[1].keys[0].path[0].idType).toMatchInlineSnapshot('"id"')
    expect(keys[1].keys[0].path[0].kind).toMatchInlineSnapshot('"testYodel"')
  })

  test('allocateOneId', async () => {
    const kvStore = getDstore()
    const id = await kvStore.allocateOneId()
    expect(id).toMatch(/\d+/)
  })
})

describe('Read', () => {
  test('get num_id', async () => {
    const kvStore = getDstore()
    const entity = { key: kvStore.key(['testYodel', 2]), data: { foo: 'bar' } }
    const entity2 = {
      key: kvStore.key(['testYodel', 3]),
      data: { foo: 'bar' },
    }
    const commitResponse = await kvStore.save([entity, entity2])
    // expect(isNumber(commitResponse?.[0]?.indexUpdates)).toBeTruthy();
    // expect(commitResponse).toMatchInlineSnapshot(`
    //   Array [
    //     Object {
    //       "indexUpdates": 0,
    //       "mutationResults": Array [
    //         Object {
    //           "conflictDetected": false,
    //           "key": null,
    //           "version": "1234567890123456",
    //         },
    //       ],
    //     },
    //   ]
    // `);
    expect(entity).toMatchInlineSnapshot(`
      {
        "data": {
          "_keyStr": "agByDwsSCXRlc3RZb2RlbBgCDKIBBHRlc3Q",
          "foo": "bar",
          Symbol(KEY): Key {
            "id": 2,
            "kind": "testYodel",
            "namespace": "test",
            "path": [
              "testYodel",
              2,
            ],
          },
        },
        "excludeLargeProperties": true,
        "key": Key {
          "id": 2,
          "kind": "testYodel",
          "namespace": "test",
          "path": [
            "testYodel",
            2,
          ],
        },
      }
    `)

    const result = await kvStore.get(entity.key)
    // get returns a single Entity
    expect(Array.isArray(result)).toBeFalsy()
    expect(result).toMatchInlineSnapshot('null')
    // expect(kvStore.readKey(result)).toBeInstanceOf(Key);

    const result2 = await kvStore.getMulti([entity.key])
    // getMulti returns a Array even for single keys
    expect(result2).toMatchInlineSnapshot(`
      [
        null,
      ]
    `)
    const result3 = await kvStore.getMulti([entity.key, kvStore.key(['testYodel', 3])])
    // getMulti returns a Array with multiple keys
    // expect(Array.isArray(result)).toBeTruthy();
    expect(result3).toMatchInlineSnapshot(`
      [
        null,
        null,
      ]
    `)
    const result4 = await kvStore.getMulti([entity.key, entity.key])
    // getMulti returns a Array but collapses duplicate keys
    // expect(Array.isArray(result)).toBeTruthy();
    // Firestore in Datastore returns the entity once
    // Datastore Emulator returns the Entity twice
    // kvStore should normalize that.
    expect(result4).toMatchInlineSnapshot(`
      [
        null,
        null,
      ]
    `)

    const result5 = await kvStore.getMulti([entity.key, kvStore.key(['YodelNotThere', 3])])
    // getMulti returns a Array but omits unknown keys
    // expect(Array.isArray(result)).toBeTruthy();
    expect(result5).toMatchInlineSnapshot(`
      [
        null,
        null,
      ]
    `)
    const result6 = await kvStore.getMulti([])
    // getMulti returns a empty Array for an empty array
    // expect(Array.isArray(result)).toBeTruthy();
    expect(result6).toMatchInlineSnapshot('[]')
  })
})

test('get name', async (t) => {
  const kvStore = getDstore()
  const entity = {
    key: kvStore.key(['testYodel', 'two']),
    data: { foo: 'bar' },
  }
  await kvStore.save([entity])
  const result = await kvStore.get(entity.key)
  expect(result?._keyStr).toMatchInlineSnapshot('"agByEgsSCXRlc3RZb2RlbCIDdHdvDKIBBHRlc3Q"')
  expect(result?.foo).toBe('bar')
})

describe('query', async () => {
  test('raw', async () => {
    const kvStore = getDstore()
    const entity = {
      key: kvStore.key(['testYodel', '3']),
      data: { foo: 'bar', baz: 'baz' },
    }

    await kvStore.save([entity])
    const query = kvStore.datastore.createQuery('testYodel')
    query.limit(1)
    const [entities, runQueryInfo] = await kvStore.datastore.runQuery(query)
    expect(entities.length).toBe(1)
    expect(entities).toMatchInlineSnapshot(`
      [
        {
          "foo": "bar",
          Symbol(KEY): Key {
            "id": "2",
            "kind": "testYodel",
            "namespace": "test",
            "path": [
              "testYodel",
              "2",
            ],
          },
        },
      ]
    `)
  })

  test('query', async () => {
    const kvStore = getDstore()
    const entity = {
      key: kvStore.key(['testYodel', '3']),
      data: { foo: 'bar', baz: 'baz' },
    }

    const saveResult = await kvStore.save([entity])
    expect(saveResult?.[0]?.mutationResults?.key).toMatchInlineSnapshot('undefined')

    // expect(saveResult).toMatchInlineSnapshot(`
    //   [
    //     {
    //       "commitTime": null,
    //       "indexUpdates": 0,
    //       "mutationResults": [
    //         {
    //           "conflictDetected": false,
    //           "createTime": {
    //             "nanos": 706047000,
    //             "seconds": "1688123436",
    //           },
    //           "key": null,
    //           "updateTime": {
    //             "nanos": 706047000,
    //             "seconds": "1688123436",
    //           },
    //           "version": "1688123436706047",
    //         },
    //       ],
    //     },
    //   ]
    // `)
    expect(await kvStore.get(entity.key)).toMatchInlineSnapshot(`
      {
        "_keyStr": "agByEAsSCXRlc3RZb2RlbCIBMwyiAQR0ZXN0",
        "baz": "baz",
        "foo": "bar",
        Symbol(KEY): Key {
          "kind": "testYodel",
          "name": "3",
          "namespace": "test",
          "path": [
            "testYodel",
            "3",
          ],
        },
      }
    `)
    // Give Datastore time to become consistent
    do { } while ((await kvStore.get(entity.key)) === null)

    const query = kvStore.createQuery('testYodel')
    query.limit(1)
    const [entities, runQueryInfo] = await kvStore.runQuery(query)
    // expect(entities.length).toBe(1)
    expect(entities).toMatchInlineSnapshot(`
      [
        {
          "_keyStr": "agByDwsSCXRlc3RZb2RlbBgCDKIBBHRlc3Q",
          "foo": "bar",
          Symbol(KEY): Key {
            "id": "2",
            "kind": "testYodel",
            "namespace": "test",
            "path": [
              "testYodel",
              "2",
            ],
          },
        },
      ]
    `)
    expect(runQueryInfo).toMatchInlineSnapshot(`
      {
        "endCursor": "Ci4SKGoOc35oZG1hc2h1cC1ocmRyDwsSCXRlc3RZb2RlbBgCDKIBBHRlc3QYACAA",
        "moreResults": "MORE_RESULTS_AFTER_LIMIT",
      }
    `)
    expect(entities?.[0]?.foo).toBe('bar')
    expect(entities?.[0]?.[Datastore.KEY]?.kind).toBe('testYodel')
    expect(runQueryInfo?.moreResults).toBe('MORE_RESULTS_AFTER_LIMIT')

    // modern interface
    const [result2] = await kvStore.query('testYodel', [], 1, [], ['baz'])
    expect(result2.length).toBe(1)
    // foo is removed by selection
    expect(JSON.parse(JSON.stringify(result2?.[0]))).toMatchInlineSnapshot(`
      {
        "_keyStr": "agByEAsSCXRlc3RZb2RlbCIBMwyiAQR0ZXN0",
        "baz": "baz",
      }
    `)

    const key = kvStore.readKey(result2?.[0])
    expect(key.id).toBe(entity.key.id)
  })
})

test('set', async () => {
  // expect.assertions(2);
  const kvStore = getDstore()
  const result = await kvStore.set(kvStore.key(['testYodel', '5e7']), {
    foo: 'bar',
  })
  expect(result.name).toBe('5e7')
  expect(result.kind).toBe('testYodel')

  // autogenerate key
  const result2 = await kvStore.set(kvStore.key(['testYodel']), { foo: 'bar' })
  expect(result2.kind).toBe('testYodel')
})

test('save / upsert', async () => {
  // expect.assertions(2);
  const kvStore = getDstore()
  const entity = {
    key: kvStore.key(['testYodel', 3]),
    data: { foo: 'bar' } as any,
  }
  const result = await kvStore.save([entity])
  // const result2 = await kvStore.upsert([entity]);
  expect(result?.[0]?.mutationResults?.[0]?.conflictDetected).toBe(false)
  expect(entity.data._keyStr).toMatchInlineSnapshot('"agByDwsSCXRlc3RZb2RlbBgDDKIBBHRlc3Q"')
  expect(entity.data.foo).toBe('bar')
  expect(entity.data[Datastore.KEY].kind).toBe('testYodel')
})

test('update', async (t) => {
  //     expect.assertions(3);
  const kvStore = getDstore()
  const keyName = `4insert${Math.random()}`
  const entity = {
    key: kvStore.key(['testYodel', keyName]),
    data: { foo: 'bar' },
  }
  // const request = kvStore.update([entity]);
  // await expect(request).rejects.toThrowError(Error);

  await kvStore.save([entity])
  const result = await kvStore.update([entity])
  expect(result?.[0]?.mutationResults?.[0]?.conflictDetected).toBe(false)
  expect(result?.[0]?.mutationResults?.[0]?.key).toBe(null)
  // expect(result?.[0]?.indexUpdates).toBe(2);
})

test('insert / delete', async (t) => {
  // expect.assertions(2);
  const kvStore = getDstore()
  const testkey = kvStore.key(['testYodel', 4])
  await kvStore.delete([testkey])
  const entity = {
    key: testkey,
    data: { foo: 'bar' } as any,
  }
  const result = await kvStore.insert([entity])

  expect(result?.[0]?.mutationResults?.[0]?.conflictDetected).toBe(false)
  expect(result?.[0]?.mutationResults?.[0]?.version).toMatch(/\d+/)
  expect(entity.data.foo).toBe('bar')
  expect(entity.key.path[0]).toBe('testYodel')
  // expect(result?.[0]?.indexUpdates).toBe(3);

  const result2 = await kvStore.delete([entity.key])
  expect(result2?.[0]?.mutationResults?.[0]?.conflictDetected).toBe(false)
})

test('exception', async () => {
  // expect.assertions(2);
  const kvStore = getDstore()
  try {
    const result = await kvStore.set(kvStore.key(['testYodel', NaN]), {
      foo: 'bar',
    })
  } catch (e) {
    expect(e.stack).toMatch(/Dstore\.set/)
  }
})
// describe("Transactions", () => {
//   it("simple", async () => {
//     expect.assertions(2);
//     const kvStore = getDstore("huwawi3Datastore");
//     const outerResult = await kvStore.runInTransaction<any>(async () => {
//       // write inside the transaction
//       const entity = { key: kvStore.key(["testYodel", 6]), data: { foo: "foobar" } };
//       const innerResult = await kvStore.save([entity]);
//       // save does not return anything within transactions
//       expect(innerResult).toMatchInlineSnapshot(`undefined`);
//       return 123;
//     });
//     expect(outerResult).toMatchInlineSnapshot(`123`);

//     // this fails in the Datastore Emulator
//     const entitiey = await kvStore.get(kvStore.key(["testYodel", 6]));
//     // expect(entitiey).toMatchInlineSnapshot(`
//     //   Object {
//     //     "foo": "foobar",
//     //     Symbol(KEY): Key {
//     //       "id": "6",
//     //       "kind": "testYodel",
//     //       "namespace": "test",
//     //       "path": Array [
//     //         "testYodel",
//     //         "6",
//     //       ],
//     //     },
//     //   }
//     // `);
//   });

//   it("throws", async () => {
//     expect.assertions(1);
//     const kvStore = getDstore("huwawi3Datastore");
//     const request = kvStore.runInTransaction<any>(async () => {
//       throw new DstoreError("TestError", undefined);
//     });
//     await expect(request).rejects.toThrowError(DstoreError);
//   });
// });

// describe('Exceptions', () => {
//   it('simple', async () => {
//     const t = () => {
//       throw new DstoreError('bla', undefined);
//     };
//     expect(t).toThrow(DstoreError);
//   });
// });
