import * as morph from "ts-morph";

import { CDSType, IDefinition } from "../utils/cds";

import { BaseType } from "./base.type";

/**
 * Type that represents a CDS enum.
 *
 * @export
 * @class Enum
 * @extends {BaseType}
 */
export class Enum extends BaseType<Enum, morph.EnumDeclarationStructure> {
    /**
     * Fields of the enum.
     *
     * @private
     * @type {Map<string, unknown>}
     * @memberof Enum
     */
    private fields: Map<string, unknown> = new Map<string, unknown>();

    /**
     * Default constructor.
     *
     * @param {string} name Name of the enum
     * @param {IDefinition} definition CDS definition of the enum
     * @param {string} [namespace] Namespace the enum belongs to
     * @memberof Enum
     */
    constructor(name: string, definition: IDefinition, namespace?: string) {
        super(name, definition, undefined, namespace);
        if (this.definition.enum) {
            for (const [key, value] of this.definition.enum) {
                this.fields.set(key, value.val);
            }
        }
    }

    /**
     * Converts the type to a Typescript type.
     *
     * @returns {morph.EnumDeclarationStructure} Created enum declaration
     * @memberof Enum
     */
    public toType(): morph.EnumDeclarationStructure {
        let result = this.createEnum();

        for (const [key, value] of this.fields) {
            result.members?.push(
                this.createEnumField(key, value, this.isStringType())
            );
        }

        return result;
    }

    /**
     * Checks if the current type is a string type.
     *
     * @returns {boolean} Flag, wheter or not this type is a string type
     * @memberof BaseType
     */
    public isStringType(): boolean {
        let result: boolean = false;

        if (
            this.definition.type === CDSType.string ||
            this.definition.type === CDSType.largeString
        ) {
            result = true;
        }

        return result;
    }
}
