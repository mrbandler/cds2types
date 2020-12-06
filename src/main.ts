import * as T from "fp-ts/lib/Task";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { CLI } from "./typeclasses/cli";
import { cli } from "./cli";

/**
 *  main :: Task a, TaskEither b => CLI a b e s -> [String] -> Task ()
 *
 * @param {CLI} cli CLI typeclass instance
 * @param {ReadonlyArray<string>} args CLI arguments
 * @returns {T.Task<void>} Main entry point task
 */
const main = (cli: CLI<T.URI, TE.URI, Error, string>) => (args: ReadonlyArray<string>): T.Task<void> => {
    return pipe(args, cli.exec, cli.log(cli.failure, cli.success));
};

/**
 * entry :: Task ()
 */
const entry = main(cli)(process.argv);

// eslint-disable-next-line ts-immutable/no-expression-statement
entry();
