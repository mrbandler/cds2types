import { CDSKind, CDSType, IDefinition, IEnumValue } from "../utils/cds";

import { ActionFunction } from "./action.func";
import { Entity } from "./entity";
import { Enum } from "./enum";
import { Token } from "../utils/type.constants";
import _ from "lodash";

/**
 * Type that represents a namespace.
 *
 * Namespaces are used to generate the type definition in it.
 * So it is possible to create a namespace that represents the file itself, hence a namespaces without a name.
 *
 * @export
 * @class Namespace
 */
export class Namespace {
    /**
     * Namespace name.
     *
     * @private
     * @type {string}
     * @memberof Namespace
     */
    private _name?: string;

    /**
     * Namespaces type definitions.
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
     * @memberof Namespace
     */
    private entities: Entity[] = [];

    /**
     * CDS action and function imports.
     *
     * @private
     * @
     * @type {Function[]}
     * @memberof Namespace
     */
    private actionFunctions: ActionFunction[] = [];

    /**
     * CDS enums.
     *
     * @private
     * @type {Enum[]}
     * @memberof Namespace
     */
    private enums: Enum[] = [];

    /**
     * Name of the namespace.
     *
     * @readonly
     * @type {string}
     * @memberof Namespace
     */
    public get name(): string {
        return this._name ? this._name : "";
    }

    /**
     * Default constructor.
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

    /**
     * Returns the entities in this namespace.
     *
     * @returns {Entity[]}
     * @memberof Namespace
     */
    public getEntities(): Entity[] {
        return this.entities;
    }

    /**
     *  Generates the code for the type definitions in the namespace.
     *
     * @param {Entity[]} otherEntities Other entities from the file namespace or all other namespaces.
     * @returns {string} Typescript code.
     * @memberof Namespace
     */
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
            code.push(
                `${Token.export} ${Token.namespace} ${this.name} ${Token.curlyBraceLeft}`
            );

        if (!_.isEmpty(actionFuncCode)) code.push(actionFuncCode);
        if (!_.isEmpty(enumCode)) code.push(enumCode);
        if (!_.isEmpty(entityCode)) code.push(entityCode);
        if (!_.isEmpty(entityEnum)) code.push(entityEnum);
        if (!_.isEmpty(sanitizedEntityEnum)) code.push(sanitizedEntityEnum);

        if (this.name && this.name !== "")
            code.push(`${Token.curlyBraceRight}`);

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
     * Extracts the types from the namespace definitions.
     *
     * @private
     * @param {string[]} blacklist Blacklist an definition keys that should not be generated.
     * @param {string} [interfacePrefix=""] Interface prefix.
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
     * Checks a given string for a given GLOB wildcard.
     *
     * @private
     * @param {string} wildcard Wildcard to check against
     * @param {string} str String to check the wildcard against
     * @returns {boolean} Flag, whether the check was succsessful
     * @memberof Namespace
     */
    private wilcard(wildcard: string, str: string): boolean {
        const re = new RegExp(
            `^${wildcard.replace(/\*/g, ".*").replace(/\?/g, ".")}$`,
            "i"
        );
        return re.test(str);
    }

    /**
     * Generates the entities enumerations.
     *
     * @private
     * @param {boolean} [sanitized=false] Flag, whether the enum should represent sanitized entities
     * @returns {Enum} Generates enum
     * @memberof Namespace
     */
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
