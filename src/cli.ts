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
 * exit :: Error -> IO ()
 *
 * @param {Error} error Error to print before exiting
 * @returns {IO<void>} IO with no return value
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
 * @returns {Either<string, Arguments>} Either a error message or parsed arguments
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
 * CLI type class instance.
 */
const cli: CLI<T.URI, TE.URI> = {
    log: flow(log, T.fromIO),
    exit: exit,
    run: flow(parse, TE.fromEither, TE.chain(run)),
    write: TE.fold,
};

/**
 * main :: Task a, TaskEither b => CLI (a, b) -> [String] -> Task ()
 *
 * @template A
 * @template B
 * @param {CLI<A, B>} cli
 * @param {ReadonlyArray<string>} args
 * @returns {T.Task<void>}
 */
const main = (cli: CLI<T.URI, TE.URI>) => (args: ReadonlyArray<string>): T.Task<void> => {
    return pipe(args, cli.run, cli.write(cli.exit, cli.log));
};

/**
 * Creating main entry point and calling it.
 */
const entry = main(cli)(process.argv);
entry();
