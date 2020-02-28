#!/usr/bin/env node

import * as commander from "commander";
import Program from "./program";

/**
 * Main function of the program.
 *
 */
function main() {
    const cli = new commander.Command();
    cli.version("1.0.1")
        .description(
            "CLI to convert CDS models to Typescript interfaces and enumerations"
        )
        .option("-c, --cds <file.cds>", "CDS file to convert")
        .option(
            "-o, --output <file.ts>",
            "Output location for the *.ts file(s)"
        )
        .option("-p, --prefix <I>", "Interface prefix", "")
        .parse(process.argv);

    if (!process.argv.slice(2).length) {
        cli.outputHelp();
    } else {
        new Program().run(cli).catch(error => console.log("Error: ", error));
    }
}

main();
