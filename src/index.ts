import * as TE from "fp-ts/lib/TaskEither";
import * as IO from "fp-ts/lib/IO";
import { pipe } from "fp-ts/lib/function";
import { CLI } from "./typeclasses/cli";
import { cli } from "./instances/cli";

/**
 *  main :: Task a, TaskEither b => CLI a b e s -> [String] -> Task ()
 *
 * @param {CLI} cli CLI typeclass instance
 * @param {ReadonlyArray<string>} args CLI arguments
 * @returns {T.Task<void>} Main entry point task
 */
const main = (cli: CLI<IO.URI, TE.URI, Error, string>) => (
    args: ReadonlyArray<string>
): IO.IO<void> => {
    return pipe(args, cli.exec, cli.log(cli.failure, cli.success));
};

/**
 * entry :: Task ()
 */
const entry = main(cli)(process.argv);

// eslint-disable-next-line functional/no-expression-statement
entry();
