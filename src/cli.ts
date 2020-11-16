import commander from "commander";
import { Arguments } from "./arguments";
import { IO } from "fp-ts/lib/IO";
import { Either, left, right, fold } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { run } from "./program";

// CLI command.
const cli = new commander.Command()
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
const parseArgs = (cmd: commander.Command) => (args: ReadonlyArray<string>): Either<string, Arguments> => {
    return !args.slice(2).length ? left(cmd.helpInformation()) : right(cmd.opts() as Arguments);
};

/**
 * exit :: String -> IO
 *
 * @param {string} error Error message to print before exiting
 * @returns {IO<void>} IO with no return value
 */
const exit = (error: string): IO<void> => {
    // eslint-disable-next-line ts-immutable/functional-parameters
    return () => {
        // eslint-disable-next-line ts-immutable/no-expression-statement
        console.error(error);
        // eslint-disable-next-line ts-immutable/no-expression-statement
        process.exit(1);
    };
};

/**
 * exec :: Arguments -> IO
 *
 * @param {Arguments} args Command-line arguments used for execution
 * @returns {IO<void>} IO with no return value
 */
const exec = (args: Arguments): IO<void> => {
    const f = fold(
        (error: string) => exit(error),
        // eslint-disable-next-line ts-immutable/functional-parameters
        (message: string) => () => console.log(message)
    );

    return f(run(args);
};

/**
 * main :: Command -> [String] -> IO
 *
 * @param {commander.Command} cmd Incoming Command-line command
 * @param {ReadonlyArray<string>} args Incoming Command-line arguments
 * @returns {IO<void>} IO with no return value
 */
const main = (cmd: commander.Command) => (args: ReadonlyArray<string>): IO<void> => {
    const parse = parseArgs(cmd);
    const f = fold(
        (error: string) => exit(error),
        (args: Arguments) => exec(args)
    );

    return pipe(parse(args), f);
};

// Creates and runs the main entry point IO
const entry = main(cli)(process.argv);
// eslint-disable-next-line ts-immutable/no-expression-statement
entry();
