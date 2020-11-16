import { toError } from "fp-ts/lib/Either";
import { IOEither, leftIO, tryCatch } from "fp-ts/lib/IOEither";
import { TaskEither } from "fp-ts/lib/TaskEither";
import * as cds from "@sap/cds";
import { Arguments } from "./arguments";

// import { parse } from "./parsers/namespace.parser";

// const loadCds = (path: string): IOEither<Error, unknown> => {
//     tryCatch(() => cds.load(path), toError);
// };

// const compileToJson = (cds: unknown): TaskEither<string, Object> => {};

/**
 * run :: Arguments -> IOEither (String, String)
 *
 * @param {Arguments} args
 * @returns {*}  {IOEither<string, string>}
 */
export const run = (args: Arguments): IOEither<string, string> => {
    // const result = parse();

    return leftIO(() => "test");
    // return isLeft(result) ? left(result.left) : right("Everything is fine!");
};
