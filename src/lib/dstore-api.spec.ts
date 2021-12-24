/*
 * dstore-api.test.ts
 *
 * Created by Dr. Maximillian Dornseif 2021-12-10 in huwawi3backend 11.10.0
 * Copyright (c) 2021 HUDORA GmbH
 */

import { Datastore } from '@google-cloud/datastore';
// import { assertIsObject, isNumber } from 'assertate';
import test from 'ava';

import { Dstore } from './dstore-api';

function getDstore(projectId) {
  return new Dstore(new Datastore({ projectId }));
}

test('keySerialize', async (t) => {
  const kvStore = getDstore('huwawi3Datastore');
  t.deepEqual(kvStore.key(['testYodel', 123]), {
    id: 123 as any, // typing in inconclusive here
    kind: 'testYodel',
    namespace: undefined,
    path: ['testYodel', 123],
  } as any);
  t.deepEqual(kvStore.key(['testYodel', 123]).path, ['testYodel', 123]);
  t.deepEqual(kvStore.key(['testYodel', 123]).serialized, {
    namespace: 'undefined',
    path: [
      'testYodel',
      {
        type: 'DatastoreInt',
        value: '123',
      },
    ],
  } as any);

  const ser = kvStore.keySerialize(kvStore.key(['testYodel', 123]));
  t.deepEqual(ser, 'agdodXdhd2kzcg8LEgl0ZXN0WW9kZWwYewyiAQR0ZXN0');
  t.deepEqual(kvStore.keyFromSerialized(ser), {
    id: '123',
    kind: 'testYodel',
    namespace: 'undefined',
    path: ['testYodel', '123'],
  } as any);
});

//   it("allocation", async () => {
//     expect.assertions(1);
//     const kvStore = getDstore("huwawi3Datastore");
//     const id = await kvStore.allocateOneId();
//     expect(id).toMatch(/\d+/);
//   });
// });

// describe("Lesen", () => {
//   it("get numid", async () => {
//     expect.assertions(10);
//     const kvStore = getDstore("huwawi3Datastore");
//     const entity = { key: kvStore.key(["testYodel", 2]), data: { foo: "bar" } };
//     const entity2 = { key: kvStore.key(["testYodel", 3]), data: { foo: "bar" } };
//     const commitResponse = await kvStore.save([entity, entity2]);
//     expect(isNumber(commitResponse?.[0]?.indexUpdates)).toBeTruthy();
//     // expect(commitResponse).toMatchInlineSnapshot(`
//     //   Array [
//     //     Object {
//     //       "indexUpdates": 0,
//     //       "mutationResults": Array [
//     //         Object {
//     //           "conflictDetected": false,
//     //           "key": null,
//     //           "version": "1234567890123456",
//     //         },
//     //       ],
//     //     },
//     //   ]
//     // `);
//     expect(entity).toMatchInlineSnapshot(`
//       Object {
//         "data": Object {
//           "foo": "bar",
//         },
//         "key": Key {
//           "id": 2,
//           "kind": "testYodel",
//           "namespace": "test",
//           "path": Array [
//             "testYodel",
//             2,
//           ],
//         },
//       }
//     `);

//     const result = await kvStore.get(entity.key);
//     // get returns a single Entity
//     expect(Array.isArray(result)).toBeFalsy();
//     expect(result).toMatchInlineSnapshot(`
//       Object {
//         "_keyStr": "agdodXdhd2kzcg8LEgl0ZXN0WW9kZWwYAgyiAQR0ZXN0",
//         "foo": "bar",
//         Symbol(KEY): Key {
//           "id": "2",
//           "kind": "testYodel",
//           "namespace": "test",
//           "path": Array [
//             "testYodel",
//             "2",
//           ],
//         },
//       }
//     `);
//     assertIsObject(result);
//     expect(kvStore.readKey(result)).toBeInstanceOf(Key);

//     const result2 = await kvStore.getMulti([entity.key]);
//     // getMulti returns a Array even foir single keys
//     expect(result2).toMatchInlineSnapshot(`
//       Array [
//         Object {
//           "_keyStr": "agdodXdhd2kzcg8LEgl0ZXN0WW9kZWwYAgyiAQR0ZXN0",
//           "foo": "bar",
//           Symbol(KEY): Key {
//             "id": "2",
//             "kind": "testYodel",
//             "namespace": "test",
//             "path": Array [
//               "testYodel",
//               "2",
//             ],
//           },
//         },
//       ]
//     `);
//     const result3 = await kvStore.getMulti([entity.key, kvStore.key(["testYodel", 3])]);
//     // getMulti returns a Array with multiple keys
//     // expect(Array.isArray(result)).toBeTruthy();
//     expect(result3).toMatchInlineSnapshot(`
//       Array [
//         Object {
//           "_keyStr": "agdodXdhd2kzcg8LEgl0ZXN0WW9kZWwYAgyiAQR0ZXN0",
//           "foo": "bar",
//           Symbol(KEY): Key {
//             "id": "2",
//             "kind": "testYodel",
//             "namespace": "test",
//             "path": Array [
//               "testYodel",
//               "2",
//             ],
//           },
//         },
//         Object {
//           "_keyStr": "agdodXdhd2kzcg8LEgl0ZXN0WW9kZWwYAwyiAQR0ZXN0",
//           "foo": "bar",
//           Symbol(KEY): Key {
//             "id": "3",
//             "kind": "testYodel",
//             "namespace": "test",
//             "path": Array [
//               "testYodel",
//               "3",
//             ],
//           },
//         },
//       ]
//     `);
//     const result4 = await kvStore.getMulti([entity.key, entity.key]);
//     // getMulti returns a Array but collapses duplicate keys
//     // expect(Array.isArray(result)).toBeTruthy();
//     // Firestore in Datastore returns the entity once
//     // Datastore Emulator returns the Entity twice
//     // kvStore should normalize that.
//     expect(result4).toMatchInlineSnapshot(`
//       Array [
//         Object {
//           "_keyStr": "agdodXdhd2kzcg8LEgl0ZXN0WW9kZWwYAgyiAQR0ZXN0",
//           "foo": "bar",
//           Symbol(KEY): Key {
//             "id": "2",
//             "kind": "testYodel",
//             "namespace": "test",
//             "path": Array [
//               "testYodel",
//               "2",
//             ],
//           },
//         },
//         Object {
//           "_keyStr": "agdodXdhd2kzcg8LEgl0ZXN0WW9kZWwYAgyiAQR0ZXN0",
//           "foo": "bar",
//           Symbol(KEY): Key {
//             "id": "2",
//             "kind": "testYodel",
//             "namespace": "test",
//             "path": Array [
//               "testYodel",
//               "2",
//             ],
//           },
//         },
//       ]
//     `);

//     const result5 = await kvStore.getMulti([entity.key, kvStore.key(["YodelGibtEsNicht", 3])]);
//     // getMulti returns a Array but obmits unknown keys
//     // expect(Array.isArray(result)).toBeTruthy();
//     expect(result5).toMatchInlineSnapshot(`
//       Array [
//         Object {
//           "_keyStr": "agdodXdhd2kzcg8LEgl0ZXN0WW9kZWwYAgyiAQR0ZXN0",
//           "foo": "bar",
//           Symbol(KEY): Key {
//             "id": "2",
//             "kind": "testYodel",
//             "namespace": "test",
//             "path": Array [
//               "testYodel",
//               "2",
//             ],
//           },
//         },
//       ]
//     `);
//     const result6 = await kvStore.getMulti([]);
//     // getMulti returns a empty Array for an empty array
//     // expect(Array.isArray(result)).toBeTruthy();
//     expect(result6).toMatchInlineSnapshot(`Array []`);
//   });

//   it("get name", async () => {
//     expect.assertions(3);
//     const kvStore = getDstore("huwawi3Datastore");
//     const entity = { key: kvStore.key(["testYodel", "zwei"]), data: { foo: "bar" } };
//     const commitResponse = await kvStore.save([entity]);
//     expect(commitResponse?.[0]?.indexUpdates).toBe(3);
//     // expect(commitResponse).toMatchInlineSnapshot(`
//     //   Array [
//     //     Object {
//     //       "indexUpdates": 0,
//     //       "mutationResults": Array [
//     //         Object {
//     //           "conflictDetected": false,
//     //           "key": null,
//     //           "version": "1234567890123456",
//     //         },
//     //       ],
//     //     },
//     //   ]
//     // `);
//     expect(entity).toMatchInlineSnapshot(`
//       Object {
//         "data": Object {
//           "foo": "bar",
//         },
//         "key": Key {
//           "kind": "testYodel",
//           "name": "zwei",
//           "namespace": "test",
//           "path": Array [
//             "testYodel",
//             "zwei",
//           ],
//         },
//       }
//     `);
//     const result = await kvStore.get(entity.key);
//     expect(result).toMatchInlineSnapshot(`
//       Object {
//         "_keyStr": "agdodXdhd2kzchMLEgl0ZXN0WW9kZWwiBHp3ZWkMogEEdGVzdA",
//         "foo": "bar",
//         Symbol(KEY): Key {
//           "kind": "testYodel",
//           "name": "zwei",
//           "namespace": "test",
//           "path": Array [
//             "testYodel",
//             "zwei",
//           ],
//         },
//       }
//     `);
//   });

//   it("query", async () => {
//     expect.assertions(5);
//     const kvStore = getDstore("huwawi3Datastore");
//     const entity = { key: kvStore.key(["testYodel", 3]), data: { foo: "bar" } };
//     const data = await kvStore.save([entity]);
//     const query = kvStore.createQuery("testYodel");
//     query.limit(1);
//     const [entities, runQueryInfo] = await kvStore.runQuery(query);
//     expect(entities.length).toBe(1);
//     expect(entities?.[0]?.foo).toMatchInlineSnapshot(`"bar"`);
//     expect(entities?.[0]?.[Datastore.KEY]?.kind).toMatchInlineSnapshot(`"testYodel"`);
//     // expect(entities).toMatchInlineSnapshot(`
//     //     Array [
//     //       Object {
//     //         "foo": "bar",
//     //         Symbol(KEY): Key {
//     //           "id": "3",
//     //           "kind": "testYodel",
//     //           "namespace": "test",
//     //           "path": Array [
//     //             "testYodel",
//     //             "3",
//     //           ],
//     //         },
//     //       },
//     //     ]
//     // `);
//     expect(runQueryInfo).toMatchInlineSnapshot(
//       { endCursor: expect.any(String) },
//       `
//       Object {
//         "endCursor": Any<String>,
//         "moreResults": "MORE_RESULTS_AFTER_LIMIT",
//       }
//     `
//     );
//     const result2 = await kvStore.query("testYodel", [], 1);
//     expect(result2[0]).toMatchInlineSnapshot(`
//       Array [
//         Object {
//           "foo": "bar",
//           Symbol(KEY): Key {
//             "id": "2",
//             "kind": "testYodel",
//             "namespace": "test",
//             "path": Array [
//               "testYodel",
//               "2",
//             ],
//           },
//         },
//       ]
//     `);
//   });
// });

// describe("Writing", () => {
//   it("save / upsert", async () => {
//     expect.assertions(2);
//     const kvStore = getDstore("huwawi3Datastore");
//     const entity = { key: kvStore.key(["testYodel", 3]), data: { foo: "bar" } };
//     const result = await kvStore.save([entity]);
//     // const result2 = await kvStore.upsert([entity]);
//     expect(result?.[0]?.mutationResults?.[0]?.conflictDetected).toMatchInlineSnapshot(`false`);
//     // expect(result).toMatchInlineSnapshot(`
//     //   Array [
//     //     Object {
//     //       "indexUpdates": 3
//     //       "mutationResults": Array [
//     //         Object {
//     //           "conflictDetected": false,
//     //           "key": null,
//     //           "version": "1234567890123456",
//     //         },
//     //       ],
//     //     },
//     //   ]
//     // `);
//     expect(entity.data[Datastore.KEY]).toMatchInlineSnapshot(`undefined`);
//   });

//   it("update", async () => {
//     expect.assertions(3);
//     const kvStore = getDstore("huwawi3Datastore");
//     const keyname = `4insert${Math.random()}`;
//     const entity = { key: kvStore.key(["testYodel", keyname]), data: { foo: "bar" } };

//     // const request = kvStore.update([entity]);
//     // await expect(request).rejects.toThrowError(Error);

//     const commitResponse = await kvStore.save([entity]);
//     // @ts-expect-error
//     commitResponse[0].mutationResults[0].version = 2;
//     expect(commitResponse?.[0]).toMatchInlineSnapshot(
//       { indexUpdates: expect.any(Number) },
//       `
//       Object {
//         "indexUpdates": Any<Number>,
//         "mutationResults": Array [
//           Object {
//             "conflictDetected": false,
//             "key": null,
//             "version": 2,
//           },
//         ],
//       }
//     `
//     );
//     const commitResponse2 = await kvStore.update([entity]);
//     if (commitResponse2?.[0]?.mutationResults?.[0]?.version) {
//       commitResponse2[0].mutationResults[0].version = 2;
//     }
//     expect(commitResponse2).toMatchInlineSnapshot(`
//       Array [
//         Object {
//           "indexUpdates": 0,
//           "mutationResults": Array [
//             Object {
//               "conflictDetected": false,
//               "key": null,
//               "version": 2,
//             },
//           ],
//         },
//       ]
//     `);

//     expect(entity.data[Datastore.KEY]).toMatchInlineSnapshot(`undefined`);
//   });

//   it("insert", async () => {
//     expect.assertions(4);
//     const kvStore = getDstore("huwawi3Datastore");
//     const keyname = `3insert${Math.random()}`;
//     const entity = { key: kvStore.key(["testYodel", keyname]), data: { foo: "bar" } };
//     const commitResponse = await kvStore.insert([entity]);
//     if (commitResponse?.[0]?.mutationResults?.[0]?.version) {
//       commitResponse[0].mutationResults[0].version = 2;
//     }
//     expect(commitResponse?.[0]).toMatchInlineSnapshot(
//       { indexUpdates: expect.any(Number) },
//       `
//       Object {
//         "indexUpdates": Any<Number>,
//         "mutationResults": Array [
//           Object {
//             "conflictDetected": false,
//             "key": null,
//             "version": 2,
//           },
//         ],
//       }
//     `
//     );
//     expect(entity.key.name).toMatch(keyname);
//     expect(entity.key.kind).toMatchInlineSnapshot(`"testYodel"`);

//     const request = kvStore.insert([entity]);
//     await expect(request).rejects.toThrowError(Error);
//     // 6 ALREADY_EXISTS: entity already exists: app: "h~huwawi3"
//     // name_space: "test"
//     // path <
//     //   Element {
//     //     type: "testYodel"
//     //     id: 5
//     //   }
//     // >
//   });
// });

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

// describe("Exceptions", () => {
//   it("simple", async () => {
//     const t = () => {
//       throw new DstoreError("bla", undefined);
//     };
//     expect(t).toThrow(DstoreError);
//   });
// });
