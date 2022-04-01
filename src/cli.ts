#!/usr/bin/env node

import commander from "commander";
import { IOptions } from "./utils/types";
import { Program } from "./program";

/**
 * Main function of the program.
 */
function main(): void {
    const cli = new commander.Command();
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    cli.version(require("../package.json").version)
        .description(
            "CLI to convert CDS models to Typescript interfaces and enumerations"
        )
        .option("-c, --cds <file.cds>", "CDS file to convert")
        .option("-o, --output <file.ts>", "Output location for the *.ts file")
        .option("-p, --prefix <I>", "Interface prefix", "")
        .option(
            "-j, --json",
            "Prints the compiled JSON representation of the CDS sources"
        )
        .option(
            "-d, --debug",
            "Prints JavaScript error message, should be used for issue reporting => https://github.com/kiko240/cds2types/issues"
        )
        .option(
            "-f, --format",
            "Flag, whether to format the outputted source code or not (will try to format with prettier rules in the project)"
        )
        .option(
            "-s, --sort",
            "Flag, whether to sort outputted source code or not"
        )
        .parse(process.argv);

    if (!process.argv.slice(2).length) {
        cli.outputHelp();
    } else {
        const options = cli.opts() as IOptions;
        new Program().run(options).catch((error: Error) => {
            const debugHint =
                "Please use the debug flag (-d, --debug) for a detailed error message.";
            console.log(
                `Unable to write types. ${options.debug ? "" : debugHint}`
            );

            if (options.debug) console.error("Error:", error.message);
            process.exit(-1);
        });
    }
}

main();
