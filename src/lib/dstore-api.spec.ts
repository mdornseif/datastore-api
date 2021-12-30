/*
 * dstore-api.test.ts
 *
 * Created by Dr. Maximilian Dornseif 2021-12-10 in huwawi3backend 11.10.0
 * Copyright (c) 2021 Dr. Maximilian Dornseif
 */

import { Datastore } from '@google-cloud/datastore';
import test from 'ava';
import Emulator from 'google-datastore-emulator';

import { Dstore } from './dstore-api';

process.env.GCLOUD_PROJECT = 'project-id'; // Set the datastore project Id globally
let emulator;

test.before(async (_t) => {
  emulator = new Emulator({ useDocker: false, debug: false });
  await emulator.start();
});

test.after('cleanup', async (_t) => {
  await emulator.stop();
});

function getDstore(projectId) {
  return new Dstore(new Datastore({ projectId }));
}

test('keySerialize', async (t) => {
  const kvStore = getDstore('test');
  t.deepEqual(kvStore.key(['testYodel', 123]).path, ['testYodel', 123]);
  t.deepEqual(JSON.parse(JSON.stringify(kvStore.key(['testYodel', 123]))), {
    id: 123 as any, // typing in inconclusive here
    kind: 'testYodel',
    path: ['testYodel', 123],
  } as any);
  const ser = kvStore.keySerialize(kvStore.key(['testYodel', 123]));
  t.deepEqual(ser, 'agByDwsSCXRlc3RZb2RlbBh7DA');
  t.deepEqual(JSON.parse(JSON.stringify(kvStore.keyFromSerialized(ser))), {
    id: '123',
    kind: 'testYodel',
    path: ['testYodel', '123'],
  } as any);
});

test('allocation', async (t) => {
  const kvStore = getDstore('test');
  const id = await kvStore.allocateOneId();
  t.regex(id, /\d+/);
});

// describe("Read", () => {
//   it("get num_id", async () => {
//     expect.assertions(10);
//     const kvStore = getDstore("test");
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
//     // getMulti returns a Array even for single keys
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

//     const result5 = await kvStore.getMulti([entity.key, kvStore.key(["YodelNotThere", 3])]);
//     // getMulti returns a Array but omits unknown keys
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
//     const entity = { key: kvStore.key(["testYodel", "two"]), data: { foo: "bar" } };
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
//           "name": "two",
//           "namespace": "test",
//           "path": Array [
//             "testYodel",
//             "two",
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
//           "name": "two",
//           "namespace": "test",
//           "path": Array [
//             "testYodel",
//             "two",
//           ],
//         },
//       }
//     `);
//   });

test('query', async (t) => {
  const kvStore = getDstore('test');
  const entity = {
    key: kvStore.key(['testYodel', '3']),
    data: { foo: 'bar', baz: 'baz' },
  };

  // legacy interface
  await kvStore.save([entity]);
  const query = kvStore.createQuery('testYodel');
  query.limit(1);
  const [entities, runQueryInfo] = await kvStore.runQuery(query);
  t.is(entities.length, 1);
  t.is(entities?.[0]?.foo, 'bar');
  t.is(entities?.[0]?.[Datastore.KEY]?.kind, 'testYodel');
  t.is(runQueryInfo?.moreResults, 'MORE_RESULTS_AFTER_LIMIT');

  // modern interface
  const [result2] = await kvStore.query('testYodel', [], 1, [], ['baz']);
  t.is(result2.length, 1);
  // foo is removed by selection
  t.deepEqual(JSON.parse(JSON.stringify(result2?.[0])), {
    baz: 'baz',
  });

  const key = kvStore.readKey(result2?.[0]);
  t.is(key.id, entity.key.id);
});

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
//     const keyName = `4insert${Math.random()}`;
//     const entity = { key: kvStore.key(["testYodel", keyName]), data: { foo: "bar" } };

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
//     const keyName = `3insert${Math.random()}`;
//     const entity = { key: kvStore.key(["testYodel", keyName]), data: { foo: "bar" } };
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
//     expect(entity.key.name).toMatch(keyName);
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
