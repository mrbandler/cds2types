import { IDefinition, CDSType, CDSKind } from "../utils/cds";
import { TypeToken } from "../utils/type.constants";
import { BaseType } from "./base.type";

/**
 * Type that represents a CDS function/action.
 *
 * @export
 * @class Function
 * @extends {BaseType}
 */
export class ActionFunction extends BaseType<ActionFunction> {
    /**
     * Function prefix.
     *
     * @private
     * @type {string}
     * @memberof Function
     */
    private readonly FUNC_PREFIX: string = "Func";

    /**
     * Action prefix.
     *
     * @private
     * @type {string}
     * @memberof ActionFunction
     */
    private readonly ACTION_PREFIX: string = "Action";

    /**
     * Kind of the action/function.
     *
     * @private
     * @type {CDSType}
     * @memberof ActionFunction
     */
    private kind: CDSKind;

    /**
     * Params of the action/function.
     *
     * @private
     * @type {string[]}
     * @memberof Function
     */
    private params: string[] = [];

    /**
     * Default constructor.
     * @param {string} name
     * @param {IDefinition} definition
     * @memberof Function
     */
    constructor(name: string, definition: IDefinition, kind: CDSKind) {
        super(name, definition);
        this.kind = kind;
        if (this.definition && this.definition.params) {
            for (const [key, _] of this.definition.params) {
                this.params.push(key);
            }
        }
    }

    /**
     * Converts the action/function to a Typescript enum.
     *
     * @returns {string}
     * @memberof Function
     */
    public toType(): string {
        let result = "";

        const prefix =
            this.kind === CDSKind.function
                ? this.FUNC_PREFIX
                : this.ACTION_PREFIX;

        let code: string[] = [];
        code.push(this.createEnum(prefix));
        code.push(
            this.createEnumField("name", this.sanitizeTarget(this.name), true)
        );
        if (this.params) {
            for (const param of this.params) {
                const fieldName = "param" + this.sanitizeName(param);
                code.push(this.createEnumField(fieldName, param, true));
            }
        }
        code.push(`${TypeToken.curlyBraceRight}`);

        result = code.join("\n");
        return result;
    }
}
