import _ from "lodash";
import { IDefinition, CDSKind, IEnumValue, CDSType } from "../utils/cds";
import { ActionFunction } from "./action.func";
import { Enum } from "./enum";
import { Entity } from "./entity";

/**
 *
 *
 * @export
 * @class Namespace
 */
export class Namespace {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof Namespace
     */
    private _name?: string;

    /**
     *
     *
     * @private
     * @type {Map<string, IDefinition>}
     * @memberof Namespace
     */
    private definitions: Map<string, IDefinition>;

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

    public get name(): string {
        return this._name ? this._name : "";
    }

    /**
     *Creates an instance of Namespace.
     * @param {Map<string, IDefinition>} definitions
     * @memberof Namespace
     */
    constructor(
        definitions: Map<string, IDefinition>,
        blacklist: string[],
        interfacePrefix: string = "",
        name?: string
    ) {
        this._name = name;
        this.definitions = definitions;
        this.extractTypes(blacklist, interfacePrefix);
    }

    public getEntities(): Entity[] {
        return this.entities;
    }

    public generateCode(otherEntities: Entity[]): string {
        let result = "";

        const actionFuncCode = this.actionFunctions
            .map(f => f.toType())
            .join("\n\n");
        const enumCode = this.enums.map(e => e.toType()).join("\n\n");
        const entityCode = this.entities
            .map(e => e.toType(otherEntities))
            .join("\n\n");

        const entityEnum = this.generateEntitiesEnum().toType();
        const sanitizedEntityEnum = this.generateEntitiesEnum(true).toType();

        let code: string[] = [];

        if (this.name && this.name !== "")
            code.push(`namespace ${this.name} {`);

        if (!_.isEmpty(actionFuncCode)) code.push(actionFuncCode);
        if (!_.isEmpty(enumCode)) code.push(enumCode);
        if (!_.isEmpty(entityCode)) code.push(entityCode);
        if (!_.isEmpty(entityEnum)) code.push(entityEnum);
        if (!_.isEmpty(sanitizedEntityEnum)) code.push(sanitizedEntityEnum);

        if (this.name && this.name !== "") code.push("}");

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
     *
     *
     * @private
     * @param {Map<string, IDefinition>} definitions
     * @param {string[]} blacklist
     * @param {string} [interfacePrefix=""]
     * @memberof Namespace
     */
    private extractTypes(
        blacklist: string[],
        interfacePrefix: string = ""
    ): void {
        for (const [key, value] of this.definitions) {
            if (blacklist.map(b => this.wilcard(b, key)).includes(true)) {
                continue;
            }

            switch (value.kind) {
                case CDSKind.entity:
                    const entity = new Entity(
                        key,
                        value,
                        interfacePrefix,
                        this.name
                    );

                    this.entities.push(entity);

                    break;
                case CDSKind.function:
                    const func = new ActionFunction(
                        key,
                        value,
                        value.kind,
                        interfacePrefix,
                        this.name
                    );

                    this.actionFunctions.push(func);

                    break;
                case CDSKind.action:
                    const action = new ActionFunction(
                        key,
                        value,
                        value.kind,
                        interfacePrefix,
                        this.name
                    );

                    this.actionFunctions.push(action);

                    break;
                case CDSKind.type:
                    if (value.enum) {
                        const _enum = new Enum(key, value, this.name);
                        this.enums.push(_enum);
                    } else {
                        const entity = new Entity(
                            key,
                            value,
                            interfacePrefix,
                            this.name
                        );

                        this.entities.push(entity);
                    }

                    break;
            }
        }
    }

    /**
     *
     *
     * @private
     * @param {string} wildcard
     * @param {string} str
     * @returns {boolean}
     * @memberof Namespace
     */
    private wilcard(wildcard: string, str: string): boolean {
        const re = new RegExp(
            `^${wildcard.replace(/\*/g, ".*").replace(/\?/g, ".")}$`,
            "i"
        );
        return re.test(str);
    }

    private generateEntitiesEnum(sanitized: boolean = false): Enum {
        const definition: IDefinition = {
            kind: CDSKind.type,
            type: CDSType.string,
            enum: new Map<string, IEnumValue>(),
        };

        if (definition.enum) {
            for (const entity of this.entities) {
                definition.enum.set(entity.getSanitizedName(), {
                    val: sanitized
                        ? entity.getSanitizedName()
                        : entity.getModelName(),
                });
            }
        }

        return sanitized
            ? new Enum("SanitizedEntity", definition)
            : new Enum("Entity", definition);
    }
}
