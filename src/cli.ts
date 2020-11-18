/* eslint-disable ts-immutable/no-expression-statement */
import commander from "commander";
import * as io from "fp-ts/lib/IO";
import * as e from "fp-ts/lib/Either";
import * as te from "fp-ts/lib/TaskEither";
import * as fp from "fp-ts/lib/function";
import { run } from "./program";
import { Arguments } from "./arguments";

// CLI command.
const cmd = new commander.Command()
    .version("2.5.1")
    .description("CLI to convert CDS models to Typescript interfaces and enumerations")
    .option("-c, --cds <file.cds>", "CDS file to convert")
    .option("-o, --output <file.ts>", "Output location for the *.ts file(s)")
    .option("-p, --prefix <I>", "Interface prefix", "")
    .option("-j, --json", "Prints the compiled JSON representation of the CDS sources")
    .parse(process.argv);

/**
 * parseArgs :: Command -> [String] -> Either (String, Arguments)
 *
 * @param {commander.Command} cmd Incoming CLI command
 * @param {ReadonlyArray<string>} args Incoming CLI arguments
 * @returns {Either<string, Arguments>} Either a error message or the parsed arguments
 */
const parseArgs = (cmd: commander.Command) => (args: ReadonlyArray<string>): e.Either<Error, Arguments> => {
    return !args.slice(2).length ? e.left(new Error(cmd.helpInformation())) : e.right(cmd.opts() as Arguments);
};

/**
 * main :: Command -> [String] -> IO
 *
 * @param {commander.Command} cmd Incoming Command-line command
 * @param {ReadonlyArray<string>} args Incoming Command-line arguments
 * @returns {IO<void>} IO with no return value
 */
const cli = (cmd: commander.Command) => (args: ReadonlyArray<string>): te.TaskEither<Error, string> => {
    const parse = parseArgs(cmd);
    const parseTask = te.fromEither(parse(args));

    return te.taskEither.chain(parseTask, run);
};

/**
 * exit :: Error -> IO
 *
 * @param {Error} error Error to print before exiting
 * @returns {IO<void>} IO with no return value
 */
const exit = (error: Error): io.IO<void> => {
    return () => {
        console.log(error.message);
        process.exit(1);
    };
};

/**
 * log :: String -> IO
 *
 * @param {string} error Error message to print before exiting
 * @returns {IO<void>} IO with no return value
 */
const log = (message: string): io.IO<void> => {
    return () => console.log(message);
};

// Creates the main entry point task.
const main = cli(cmd)(process.argv);

// Executs the main entry points task,
// folds the resulting either
// and finally executes the IO that logs to the console.
main()
    .then(result => fp.pipe(result, e.fold(exit, log)))
    .then(io => io());
