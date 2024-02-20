import { randomInt } from "crypto";
import { types as CassandraTypes } from "cassandra-driver";
import bcrypt from "bcrypt";
import { PROD, DEV, QA } from "../const/app-const";



interface Tuple {
    elements: any[];
    length: number;
}

interface Tuple {
    elements: any[];
    length: number;
}

interface Row {
    [key: string]: Tuple;
}

export function rowToJson(row: Row): any {
    const columnNames = Object.keys(row);
    const tuple = row[columnNames[0]];

    const elements = tuple.elements;
    const json: any = {};

    for (let i = 0; i < columnNames.length; i++) {
        json[columnNames[i]] = elements[i];
    }

    return json;
}




export function isValidUuid(uuid: string): boolean {
    const uuidRegex =
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return uuidRegex.test(uuid);
}

export function hasProperty<T>(obj: T, prop: keyof T) {
    const _obj = {
        ...obj,
    } as object;
    return prop in _obj;
}

export function getDateString(date: Date | string): string | null {
    if (date === null || date === undefined) {
        return null;
    }
    if (typeof date === "string") {
        return new Date(date).toDateString();
    } else if (date instanceof Date) {
        return date.toDateString();
    } else {
        return date;
    }
}

export function getDate(date: Date | string): Date | null {
    if (date === null || date === undefined) {
        return null;
    }
    if (typeof date === "string") {
        return new Date(date);
    } else if (date instanceof Date) {
        return date;
    } else {
        return date;
    }
}

/**
 * getting selected env file name
 * @param env
 * @returns
 */
export function getENVFileName(env: any): string {
    let currentENVFile = "";
    switch (env) {
        case PROD:
            currentENVFile = "prod.env";
            break;
        case DEV:
            currentENVFile = "dev.env";
            break;
        case QA:
            currentENVFile = "qa.env";
            break;
     
        default:
            currentENVFile = "dev.env";
            break;
    }
    return currentENVFile;
}



export function generateUUID(): number {
    return randomInt(2000);
}
export function convertUUID(str: string): CassandraTypes.Uuid {
    return CassandraTypes.Uuid.fromString(str);
}
export function isValidUUid(uuid: string): boolean {
    const uuidRegex =
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return uuidRegex.test(uuid);
}
export function areDataTypesEqual(
    dataType1: string,
    dataType2: string
): boolean {
    // Function to normalize the data type strings for case-insensitive comparison
    function normalizeDataType(dataType: string): string {
        return dataType.toLowerCase();
    }

    const normalizedDataType1 = normalizeDataType(dataType1);
    const normalizedDataType2 = normalizeDataType(dataType2);

    // Compare the normalized data type strings
    if (normalizedDataType1 === normalizedDataType2) {
        // Use regex to match inner components of data types and compare
        const innerPattern = /<[^<>]+>/g;
        const innerMatches1 = dataType1.match(innerPattern);
        const innerMatches2 = dataType2.match(innerPattern);

        if (
            innerMatches1 &&
            innerMatches2 &&
            innerMatches1.length === innerMatches2.length
        ) {
            // If the number of inner components matches, compare each inner component
            for (let i = 0; i < innerMatches1.length; i++) {
                if (
                    normalizeDataType(innerMatches1[i]) !==
                    normalizeDataType(innerMatches2[i])
                ) {
                    return false; // Inner components are different
                }
            }
            return true; // All inner components are the same
        }
    }

    return false; // Data types are not equal
}

/**
 * generate password hash with given slat
 * @param password
 * @returns
 */
export async function generatePasswordHash(password: string): Promise<string> {
    const saltRounds = 10;
    try {
        return await bcrypt.hash(password, saltRounds);
    } catch (error) {
        console.error("Error generating password hash:", error);
        throw error;
    }
}
/**
 * match given password
 * @param input
 * @param saved
 * @returns
 */
export async function isMatchEncryption(
    input: string,
    saved: string
): Promise<boolean> {
    try {
        const match = await bcrypt.compare(input, saved);
        return match;
    } catch (error) {
        console.error("Error comparing password:", error);
        throw error; // You may want to handle the error more gracefully in your application
    }
}


/**
 * delay function for sleep the an operation
 * @param ms
 * @returns
 */
export async function delay(ms: number) {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}


/**
 * get full name
 * @param firstName
 * @param lastName
 * @returns
 */
export function getFullName(firstName: string, lastName: string): string {
    const lName = lastName ? lastName : "";
    const fName = firstName ? firstName : "";
    return fName + " " + lName;
}

/**
 * Remove Duplicates from string list
 * @param strings
 * @returns
 */
export function removeDuplicatesStringList(strings: string[]): string[] {
    const uniqueSet = new Set(strings);
    const uniqueArray = Array.from(uniqueSet);
    return uniqueArray;
}
export function mapInsertParams(row: any[]): any[] {
    return row.map((value) => {
        if (value instanceof CassandraTypes.Uuid) {
            return value;
        } else if (typeof value === "string" && isValidUuid(value)) {
            return CassandraTypes.Uuid.fromString(value);
        } else {
            return value;
        }
    });
}
export function isRequiredFieldsAvailable(
    requestJson: Record<string, any>,
    requiredFields: string[]
): boolean {
    for (const field of requiredFields) {
        const value = requestJson[field];

        // Check if the field is not present or if the trimmed value is empty
        if (!(field in requestJson) || !value) {
            return false;
        }
    }
    return true;
}
