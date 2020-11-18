import * as e from "fp-ts/lib/Either";
import * as te from "fp-ts/lib/TaskEither";
import * as ioe from "fp-ts/lib/IOEither";
import * as cds from "@sap/cds";
import { CSN } from "@sap/cds-reflect/apis/csn";
import { Arguments } from "./arguments";
import * as fs from "fs-extra";

/**
 * load :: String -> TaskEither (Error, CSN)
 *
 * @param {string} path Path to load the CDS source from
 * @returns {te.TaskEither<Error, CSN>} Task, either resulting in an error or CSN
 */
const load = (path: string): te.TaskEither<Error, CSN> => te.tryCatch(() => cds.load(path), e.toError);

/**
 * cds2json :: CSN -> JSON
 *
 * @param {CSN} csn
 * @returns {JSON}
 */
const cds2Json = (csn: CSN): JSON => JSON.parse(cds.compile.to.json(csn));

/**
 * load2json :: String -> TaskEither (Error, JSON)
 *
 * @param {string} path Path to load the CDS source from
 * @returns {te.TaskEither<Error, JSON>} Task, either resulting in an error or JSON object
 */
const load2json = (path: string): te.TaskEither<Error, JSON> => te.taskEither.map(load(path), cds2Json);

/**
 * writeFile :: String -> String -> IOEither (Error, string)
 *
 * @param {string} path Path write the file at
 * @param {string} content Content to write to the file
 * @returns {ioe.IOEither<Error, string>} IO, either resulting in an errror or a success message
 */
const writeFile = (path: string) => (content: string): ioe.IOEither<Error, string> => {
    return ioe.tryCatch(() => {
        // eslint-disable-next-line ts-immutable/no-expression-statement
        fs.writeFileSync(path, content);

        return `Successfully wrote ${path}`;
    }, e.toError);
};

/**
 * run :: Arguments -> IOEither (String, String)
 *
 * @param {Arguments} args
 * @returns {*}  {IOEither<string, string>}
 */
export const run = (args: Arguments): te.TaskEither<Error, string> => {
    const writeJsonFile = (path: string) => (json: JSON): te.TaskEither<Error, string> => {
        const e = writeFile(path)(JSON.stringify(json));
        return te.fromIOEither(e);
    };

    return te.taskEither.chain(load2json(args.cds), writeJsonFile(args.output + ".json"));
};
