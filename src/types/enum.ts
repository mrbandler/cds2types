import { IDefinition, CDSType } from "../utils/cds";
import { TypeToken } from "../utils/type.constants";
import { BaseType } from "./base.type";

/**
 * Type that represents a CDS enum.
 *
 * Will be converted into a Typescript enum.
 *
 * @export
 * @class Enum
 * @extends {BaseType}
 */
export class Enum extends BaseType {
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
     * @param {string} name Name of the enum
     * @param {IDefinition} definition CDS definition of the enum
     * @memberof Enum
     */
    constructor(name: string, definition: IDefinition) {
        super(name, definition);
        if (this.definition.enum) {
            for (const [key, value] of this.definition.enum) {
                this.fields.set(key, value.val);
            }
        }
    }

    /**
     * Converts the type to a Typescript type.
     *
     * @returns {string}
     * @memberof Enum
     */
    public toType(): string {
        let result = "";

        let code: string[] = [];
        code.push(this.createEnum());
        for (const [key, value] of this.fields) {
            code.push(this.createEnumField(key, value, this.isStringType()));
        }
        code.push(`${TypeToken.curlyBraceRight}`);

        result = code.join("\n");
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
