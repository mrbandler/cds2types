import * as cds from "@sap/cds";
import * as fs from "fs-extra";
import * as path from "path";
import { Command } from "commander";
import {
    CDSKind,
    IService,
    IDefinition,
    CDSType,
    IParamType,
    IEnumValue,
} from "./utils/cds";
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
     * Blacklist of entities, types and enums that should not be generated.
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
        "User",
    ];

    /**
     * CDS entities.
     *
     * @private
     * @type {Entity[]}
     * @memberof Program
     */
    private entities: Entity[] = [];

    /**
     * CDS action and function imports.
     *
     * @private
     * @
     * @type {Function[]}
     * @memberof Program
     */
    private actionFunctions: ActionFunction[] = [];

    /**
     * CDS enums.
     *
     * @private
     * @type {Enum[]}
     * @memberof Program
     */
    private enums: Enum[] = [];

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
        // fs.writeFileSync(command.output + ".json", JSON.stringify(jsonObj));
        const service = new CDSParser().parse(jsonObj);

        this.extractTypes(service);
        const contents = this.generateTypes();
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
    private extractTypes(service: IService): void {
        for (const [key, value] of service.definitions) {
            if (this.blacklist.map(b => this.wilcard(b, key)).includes(true)) {
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
                        new ActionFunction(
                            key,
                            value,
                            value.kind,
                            this.interfacePrefix
                        )
                    );
                    break;
                case CDSKind.action:
                    this.actionFunctions.push(
                        new ActionFunction(
                            key,
                            value,
                            value.kind,
                            this.interfacePrefix
                        )
                    );
                    break;
                case CDSKind.type:
                    if (value.enum) {
                        this.enums.push(new Enum(key, value));
                    } else {
                        this.entities.push(
                            new Entity(key, value, this.interfacePrefix)
                        );
                    }
                    break;
            }
        }
    }

    /**
     * Generates all types.
     *
     * @private
     * @returns {string} Types in form of Typescript code
     * @memberof Program
     */
    private generateTypes(): string {
        let result = "";

        const actionFuncCode = this.actionFunctions
            .map(f => f.toType())
            .join("\n\n");
        const enumCode = this.enums.map(e => e.toType()).join("\n\n");
        const entityCode = this.entities
            .map(e => e.toType(this.entities))
            .join("\n\n");

        const code = [
            actionFuncCode,
            enumCode,
            entityCode,
            this.generateEntityEnum().toType(),
        ];

        for (const c of code) {
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
     * Generates the entities enum.
     *
     * @private
     * @returns {Enum} Generated enum.
     * @memberof Program
     */
    private generateEntityEnum(): Enum {
        const definition: IDefinition = {
            kind: CDSKind.type,
            type: CDSType.string,
            enum: new Map<string, IEnumValue>(),
        };

        if (definition.enum) {
            for (const entity of this.entities) {
                definition.enum.set(entity.getSanitizedName(), {
                    val: entity.getModelName(),
                });
            }
        }

        return new Enum("Entity", definition);
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
            fs.writeFileSync(filepath, contents);
            console.log(`Wrote types to '${filepath}'`);
        } else {
            console.log(
                `Unable to write types: '${dir}' is not a valid directory`
            );
            process.exit(-1);
        }
    }

    /**
     * Tests a wildcard string.
     *
     * @private
     * @param {string} wildcard Wilcard to test
     * @param {string} str  String to test against
     * @returns {boolean} Flag, wheter the test was successfull or not
     * @memberof Program
     */
    private wilcard(wildcard: string, str: string): boolean {
        const re = new RegExp(
            `^${wildcard.replace(/\*/g, ".*").replace(/\?/g, ".")}$`,
            "i"
        );
        return re.test(str);
    }
}
