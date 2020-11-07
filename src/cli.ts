#!/usr/bin/env node

import commander from "commander";

import { IOptions } from "./utils/types";
import { Program } from "./program";

/**
 * Main function of the program.
 */
function main() {
    const cli = new commander.Command();
    cli.version("2.5.0")
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
        .parse(process.argv);

    if (!process.argv.slice(2).length) {
        cli.outputHelp();
    } else {
        const options = cli.opts() as IOptions;
        new Program().run(options);
        // .catch((error) => {
        //     console.error(`Unable to write types to '${cli.output}'`);
        //     console.error("Error:", error.message);
        // });
    }
}

main();
