import commander from "commander";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import * as IO from "fp-ts/lib/IO";
import { flow, pipe } from "fp-ts/lib/function";
import { log } from "fp-ts/lib/Console";
import { CLI } from "../typeclasses/cli";
import { _cds as cds } from "./cds";
import { Arguments } from "../arguments";
import { CDS } from "../typeclasses/cds";

/**
 * write :: String -> Task ()
 *
 * @param {string} msg Message to write
 * @returns {T.Task<void>} Task resulting in no value
 */
const write = (msg: string): IO.IO<void> => pipe(msg, log);

/**
 * exit :: Error -> Task ()
 *
 * @param {Error} error Error to print before exiting
 * @returns {T.Task<void>} Task resulting in no value
 */
// eslint-disable-next-line functional/functional-parameters
const exit = (error: Error): IO.IO<void> => () =>
    console.error(error.message, 1);

/**
 * parse :: [String] -> Either (String, Arguments)
 *
 * @param {ReadonlyArray<string>} args CLI arguments
 * @returns {E.Either<string, Arguments>} Either a error message or parsed arguments
 */
const parse = (args: ReadonlyArray<string>): E.Either<Error, Arguments> => {
    const cmd = new commander.Command()
        .version("2.5.1")
        .description(
            "CLI to convert CDS models to Typescript interfaces and enumerations"
        )
        .option("-c, --cds <file.cds>", "CDS file to convert")
        .option(
            "-o, --output <file.ts>",
            "Output location for the *.ts file(s)"
        )
        .option("-p, --prefix <I>", "Interface prefix", "")
        .option(
            "-j, --json",
            "Prints the compiled JSON representation of the CDS sources"
        )
        .parse(args.map(a => a));

    const help = cmd.helpInformation();
    return !args.slice(2).length
        ? E.left(new Error(help))
        : E.right(cmd.opts() as Arguments);
};

/**
 * run :: CDS -> [String] -> TaskEither (Error, String)
 *
 * @param {CDS<TE.URI>} cds CDS typeclass instance
 * @param {Arguments} args Arguments
 * @returns {TE.TaskEither<Error, string>} Task either resulting into a error or a message string
 */
const run = (cds: CDS<TE.URI>) => (
    args: Arguments
): TE.TaskEither<Error, string> => {
    const cds2Json = flow(cds.read, TE.map(cds.json));

    return pipe(args.cds, cds2Json, TE.chain(cds.write(args.output + ".json")));
};

/**
 * exec :: [String] -> TaskEither (Error, String)
 *
 * @param {ReadonlyArray<string>} args CLI arguments
 * @returns {T.TaskEither<Error, string>} Task either resulting in a error or a message
 */
const exec = flow(parse, TE.fromEither, TE.chain(run(cds)));

/**
 * log :: (Error -> IO ()) -> (String -> IO ()) -> TaskEither (Error, String) -> IO ()
 *
 * @param {(e: Error) => IO.IO<void>} left Error handler
 * @param {(s: string) => IO.IO<void>} right Success handler
 * @returns {((result: TE.TaskEither<Error, string>) => IO.IO<void>)} Actual log function
 */
const _log = (
    left: (e: Error) => IO.IO<void>,
    right: (s: string) => IO.IO<void>
): ((result: TE.TaskEither<Error, string>) => IO.IO<void>) =>
    TE.fold(
        (e: Error) => TE.fromIO(left(e)),
        (s: string) => TE.fromIO(right(s))
    );

/**
 * CLI typeclass instance.
 */
export const cli: CLI<IO.URI, TE.URI, Error, string> = {
    success: write,
    failure: exit,
    exec: exec,
    log: _log,
};
