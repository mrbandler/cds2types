#!/usr/bin/env node

import commander from "commander";

import { IOptions } from "./utils/types";
import { Program } from "./program";

/**
 * Main function of the program.
 */
function main() {
    const cli = new commander.Command();
    cli.version("2.5.1")
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
            "Prints JavaScript error message, should be used for issue reporting => https://github.com/mrbandler/cds2types/issues"
        )
        .option(
            "-f, --formatter <prettier/eslint>",
            "Formatter to use, will read project configuration and apply it",
            (value: string) => value.toLowerCase()
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
