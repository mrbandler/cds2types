import _ from "lodash";
import ts from "typescript";
import * as cds from "@sap/cds";
import * as fs from "fs-extra";
import * as path from "path";
import { Command } from "commander";
import { IParsed } from "./utils/cds";
import { CDSParser } from "./cds.parser";
import { Namespace } from "./types/namespace";

/**
 * Main porgram class.
 *
 * @export
 * @class Program
 */
export default class Program {
    /**
     * Blacklist of entities, types and enums that should not be generated.
     *
     * @private
     * @type {string[]}
     * @memberof Program
     */
    private readonly blacklist: string[] = [
        // "Country",
        // "Currency",
        // "Language",
        // "cuid",
        // "*sap.common*",
        // "User",
    ];

    /**
     * Interface prefix.
     *
     * @private
     * @type {string}
     * @memberof Program
     */
    private interfacePrefix: string = "";

    /**
     * Main method.
     *
     * @param {Command} command Parsed CLI options.
     * @memberof Program
     */
    public async run(command: Command): Promise<void> {
        this.interfacePrefix = command.prefix;

        const jsonObj = await this.loadCdsAndConvertToJSON(command.cds);

        if (command.json) {
            fs.writeFileSync(command.output + ".json", JSON.stringify(jsonObj));
        }

        const parsed = new CDSParser().parse(jsonObj);
        const contents = this.generateCode(parsed);
        this.writeTypes(command.output, contents);
    }

    /**
     * Loads a given CDS file and parses the compiled JSON to a object.
     *
     * @private
     * @param {string} path Path to load the CDS file from.
     * @returns {Promise<any>}
     * @memberof Program
     */
    private async loadCdsAndConvertToJSON(path: string): Promise<Object> {
        const csn = await cds.load(path);
        return JSON.parse(cds.compile.to.json(csn));
    }

    /**
     * Extracts the types from a parsed service.
     *
     * @private
     * @param {IService} service Parsed service to extract types from.
     * @returns {IService}
     * @memberof Program
     */
    private generateCode(parsed: IParsed): string {
        let result = "";
        let generatedCode: string[] = [];
        let namespaces: Namespace[] = [];

        if (parsed.namespaces) {
            for (let namespace of parsed.namespaces) {
                const ns = new Namespace(
                    namespace.definitions,
                    this.blacklist,
                    this.interfacePrefix,
                    namespace.name
                );

                namespaces.push(ns);
            }
        }

        if (parsed.services) {
            for (const service of parsed.services) {
                const ns = new Namespace(
                    service.definitions,
                    this.blacklist,
                    this.interfacePrefix,
                    service.name
                );

                namespaces.push(ns);
            }
        }

        if (parsed.definitions) {
            const ns = new Namespace(
                parsed.definitions,
                this.blacklist,
                this.interfacePrefix
            );

            namespaces.push(ns);
        }

        for (const namespace of namespaces) {
            const entities = _.flatten(namespaces.map(n => n.getEntities()));
            const code = namespace.generateCode(entities);
            generatedCode.push(code);
        }

        for (const c of generatedCode) {
            if (c && c !== "") {
                if (result !== "") {
                    result = result + c + "\n\n";
                } else {
                    result = c + "\n\n";
                }
            }
        }

        return result;
    }

    /**
     * Writes the types to disk.
     *
     * @private
     * @param {string} filepath File path to save the types at
     * @memberof Program
     */
    private writeTypes(filepath: string, contents: string): void {
        const dir = path.dirname(filepath);
        if (fs.existsSync(dir)) {
            const source = ts.createSourceFile(
                filepath,
                contents,
                ts.ScriptTarget.Latest,
                false,
                ts.ScriptKind.TS
            );

            const printer = ts.createPrinter({
                newLine: ts.NewLineKind.LineFeed,
                noEmitHelpers: false,
            });

            fs.writeFileSync(filepath, printer.printFile(source));
            console.log(`Wrote types to '${filepath}'`);
        } else {
            console.log(
                `Unable to write types: '${dir}' is not a valid directory`
            );
            process.exit(-1);
        }
    }
}
