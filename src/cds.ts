import * as cds from "@sap/cds";
import { CSN } from "@sap/cds-reflect/apis/csn";
import * as fs from "fs-extra";
import { pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/lib/Either";
import * as IOE from "fp-ts/lib/IOEither";
import * as TE from "fp-ts/lib/TaskEither";
import { CDS } from "./typeclasses/cds";

/**
 * load :: String -> TaskEither (Error, CSN)
 *
 * @param {string} path Path to load the CDS source from
 * @returns {te.TaskEither<Error, CSN>} Task, either resulting in an error or CSN
 */
const load = (path: string): TE.TaskEither<Error, CSN> => TE.tryCatch(() => cds.load(path), E.toError);

/**
 * cds2json :: CSN -> JSON
 *
 * @param {CSN} csn
 * @returns {JSON}
 */
const csn2Json = (csn: CSN): JSON => JSON.parse(cds.compile.to.json(csn));

/**
 * writeFile :: String -> String -> IOEither (Error, string)
 *
 * @param {string} path Path to write the file to
 * @param {string} content Content to write to the file
 * @returns {ioe.IOEither<Error, string>} IO, either resulting in an errror or a success message
 */
const write = (path: string) => (content: JSON): IOE.IOEither<Error, string> =>
    IOE.tryCatch(() => {
        // eslint-disable-next-line ts-immutable/no-expression-statement
        fs.writeFileSync(path, JSON.stringify(content));

        return `Successfully wrote ${path}`;
    }, E.toError);

/**
 * CDS typeclass instance.
 */
export const _cds: CDS<TE.URI> = {
    read: load,
    json: csn2Json,
    write: (path: string) => (json: JSON): TE.TaskEither<Error, string> => pipe(write(path)(json), TE.fromIOEither),
};
