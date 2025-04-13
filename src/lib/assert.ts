/*
 * assert.ts
 * 
 * Created by Dr. Maximillian Dornseif 2025-04-11 in datastore-api 6.0.1
 */

import { Datastore, Key } from '@google-cloud/datastore'
import { AssertionMessageType, assert, getType } from 'assertate-debug'

/**
 * Generates an type assertion message for the given `value`
 *
 * @param value value being type-checked
 * @param type the expected value as a string; eg 'string', 'boolean', 'number'
 * @param variableName the name of the variable being type-checked
 * @param additionalMessage further information on failure
 */
let AssertionMessage: AssertionMessageType = (
    value,
    type,
    variableName?,
    additionalMessage?
): string => {
    let message = variableName
        ? `${variableName} must be of type '${type}', '${getType(value)}' provided`
        : `expected value of type '${type}', '${getType(value)}' provided`
    return additionalMessage ? `${message}: ${additionalMessage}` : message
}

/**
 * Type-checks the provided `value` to be a symbol, throws an Error if it is not
 *
 * @param value the value to type-check as a symbol
 * @param variableName the name of the variable to be type-checked
 * @param additionalMessage further information on failure
 * @throws {Error}
 */
export function assertIsKey(
    value: unknown,
    variableName?: string,
    additionalMessage?: string
): asserts value is Key {
    assert(
        Datastore.isKey(value as any),
        AssertionMessage(value, "Key", variableName, additionalMessage)
    )
}





