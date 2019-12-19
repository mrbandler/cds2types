import * as cds from "@sap/cds";
import * as fs from "fs-extra";
import * as path from "path";
import { Command } from "commander";
import { CDSKind, IService } from "./utils/cds";
import { Entity } from "./types/entity";
import { Enum } from "./types/enum";
import { ActionFunction } from "./types/action.func";
import { CDSParser } from "./cds.parser";

/**
 * Main porgram class.
 *
 * @export
 * @class Program
 */
export default class Program {
    /**
     *
     *
     * @private
     * @type {string[]}
     * @memberof Program
     */
    private readonly blacklist: string[] = [
        "Country",
        "Currency",
        "Language",
        "cuid",
        "*sap.common*",
    ];

    /**
     *
     *
     * @private
     * @type {Entity[]}
     * @memberof Program
     */
    private entities: Entity[] = [];

    /**
     *
     *
     * @private
     * @
     * @type {Function[]}
     * @memberof Program
     */
    private actionFunctions: ActionFunction[] = [];

    /**
     *
     *
     * @private
     * @type {Enum[]}
     * @memberof Program
     */
    private enums: Enum[] = [];

    /**
     *
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
        fs.writeFileSync(command.output + ".json", JSON.stringify(jsonObj));

        const service = new CDSParser().parse(jsonObj);
        this.extractTypes(service);
        this.writeTypes(command.output);
    }

    /**
     *
     *
     * @private
     * @param {string} path
     * @returns {Promise<any>}
     * @memberof Program
     */
    private async loadCdsAndConvertToJSON(path: string): Promise<Object> {
        const csn = await cds.load(path);
        return JSON.parse(cds.compile.to.json(csn));
    }

    private wilcardTest(wildcard: string, str: string): boolean {
        const re = new RegExp(
            `^${wildcard.replace(/\*/g, ".*").replace(/\?/g, ".")}$`,
            "i"
        );
        return re.test(str);
    }

    /**
     *
     *
     * @private
     * @param {string} json
     * @returns {IService}
     * @memberof Program
     */
    private extractTypes(service: IService): void {
        for (const [key, value] of service.definitions) {
            if (
                this.blacklist.map(b => this.wilcardTest(b, key)).includes(true)
            ) {
                continue;
            }

            switch (value.kind) {
                case CDSKind.entity:
                    this.entities.push(
                        new Entity(key, value, this.interfacePrefix)
                    );
                    break;
                case CDSKind.function:
                    this.actionFunctions.push(
                        new ActionFunction(key, value, value.kind)
                    );
                    break;
                case CDSKind.action:
                    this.actionFunctions.push(
                        new ActionFunction(key, value, value.kind)
                    );
                    break;
                case CDSKind.type:
                    if (value.enum) {
                        this.enums.push(new Enum(key, value));
                    }
                    break;
            }
        }
    }

    private writeTypes(filepath: string): void {
        const actionFuncCode = this.actionFunctions
            .map(f => f.toType())
            .join("\n\n");
        const enumCode = this.enums.map(e => e.toType()).join("\n\n");
        const entityCode = this.entities.map(e => e.toType()).join("\n\n");

        let contents = "";
        const code = [actionFuncCode, enumCode, entityCode];
        for (const c of code) {
            if (c && c !== "") {
                if (contents !== "") {
                    contents = contents + c + "\n\n";
                } else {
                    contents = c + "\n\n";
                }
            }
        }

        const dir = path.dirname(filepath);
        if (fs.existsSync(dir)) {
            fs.writeFileSync(filepath, contents);
            console.log(`Wrote types to '${filepath}'`);
        } else {
            console.log(
                `Unable to write types: '${dir}' is not a valid directory`
            );
            process.exit(-1);
        }
    }
}
