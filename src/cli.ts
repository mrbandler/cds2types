/* eslint-disable ts-immutable/no-expression-statement */
import commander from "commander";
import * as E from "fp-ts/lib/Either";
import * as T from "fp-ts/lib/Task";
import * as TE from "fp-ts/lib/TaskEither";
import { flow, pipe } from "fp-ts/lib/function";
import { log } from "fp-ts/lib/Console";
import { run } from "./program";
import { Arguments } from "./arguments";
import { CLI } from "./typeclasses/cli";

/**
 * exit :: Error -> Task ()
 *
 * @param {Error} error Error to print before exiting
 * @returns {T.Task<void>} Task with no return value
 */
const exit = (error: Error): T.Task<void> => () =>
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    new Promise<void>((resolve, _) => {
        console.error(error.message, 1);
        resolve();
    });

/**
 * parse :: [String] -> Either (String, Arguments)
 *
 * @param {ReadonlyArray<string>} args CLI arguments
 * @returns {E.Either<string, Arguments>} Either a error message or parsed arguments
 */
const parse = (args: ReadonlyArray<string>): E.Either<Error, Arguments> => {
    const cmd = new commander.Command()
        .version("2.5.1")
        .description("CLI to convert CDS models to Typescript interfaces and enumerations")
        .option("-c, --cds <file.cds>", "CDS file to convert")
        .option("-o, --output <file.ts>", "Output location for the *.ts file(s)")
        .option("-p, --prefix <I>", "Interface prefix", "")
        .option("-j, --json", "Prints the compiled JSON representation of the CDS sources")
        .parse(args.map(a => a));

    const help = cmd.helpInformation();
    return !args.slice(2).length ? E.left(new Error(help)) : E.right(cmd.opts() as Arguments);
};

/**
 * CLI typeclass instance type declaration.
 */
type _CLI = CLI<T.URI, TE.URI, Error, string>;

/**
 * CLI typeclass instance.
 */
const cli: _CLI = {
    success: flow(log, T.fromIO),
    failure: exit,
    exec: flow(parse, TE.fromEither, TE.chain(run)),
    log: TE.fold,
};

/**
 *  main :: Task a, TaskEither b, => CLI (a, b, e, s) -> [String] -> Task ()
 *
 * @param {_CLI} cli CLI typeclass instance
 * @param {ReadonlyArray<string>} args CLI arguments
 * @returns {T.Task<void>} Main entry point task
 */
const main = (cli: _CLI) => (args: ReadonlyArray<string>): T.Task<void> => {
    return pipe(args, cli.exec, cli.log(cli.failure, cli.success));
};

/**
 * Creating main entry point and calling it.
 *
 * entry :: Task ()
 */
const entry = main(cli)(process.argv);
entry();
