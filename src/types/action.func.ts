import * as morph from "ts-morph";

import { CDSKind, CDSType, IDefinition, IParamType, IRef } from "../utils/cds";

import { BaseType } from "./base.type";
import { Entity } from "./entity";

/**
 * Action/Function toType return type.
 *
 * @export
 * @interface IActionFunctionDeclarationStructure
 */
export interface IActionFunctionDeclarationStructure {
    enumDeclarationStructure: morph.EnumDeclarationStructure;
    interfaceDeclarationStructure?: morph.InterfaceDeclarationStructure;
}

/**
 * Type that represents a CDS ActionFunction/action.
 *
 * @export
 * @class ActionFunction
 * @extends {BaseType}
 */
export class ActionFunction extends BaseType<
    Entity,
    IActionFunctionDeclarationStructure
> {
    /**
     * ActionFunction prefix.
     *
     * @private
     * @type {string}
     * @memberof ActionFunction
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
     * Kind of the action/ActionFunction.
     *
     * @private
     * @type {CDSType}
     * @memberof ActionFunction
     */
    private kind: CDSKind;

    /**
     * Params of the action/ActionFunction.
     *
     * @private
     * @type {string[]}
     * @memberof ActionFunction
     */
    private params: string[] = [];

    /**
     * Default constructor.
     *
     * @param {string} name Name of the action/function
     * @param {IDefinition} definition Definition of the action/function
     * @param {CDSKind} kind Kind of the action/function
     * @param {string} [interfacePrefix] Interface prefix
     * @param {string} [namespace] Namespace the action/function belongs to
     * @memberof ActionFunction
     */
    constructor(
        name: string,
        definition: IDefinition,
        kind: CDSKind,
        interfacePrefix?: string,
        namespace?: string
    ) {
        super(name, definition, interfacePrefix, namespace);
        this.kind = kind;
        if (this.definition && this.definition.params) {
            for (const [key, _] of this.definition.params) {
                this.params.push(key);
            }
        }
    }

    /**
     * Converts the action/function to corresponding Typescript types.
     *
     * @param {Entity[]} types External types, used for parameter resolution
     * @returns {IActionFunctionDeclarationStructure} Generates typescript types
     * @memberof ActionFunction
     */
    public toType(types: Entity[]): IActionFunctionDeclarationStructure {
        const prefix =
            this.kind === CDSKind.function
                ? this.FUNC_PREFIX
                : this.ACTION_PREFIX;

        return {
            enumDeclarationStructure: this.createEnumDeclaration(prefix),
            interfaceDeclarationStructure: this.createInterfaceDeclaration(
                prefix,
                types
            ),
        };
    }

    /**
     * Creates the Typescript enum declaration.
     *
     * @private
     * @param {string} prefix Kind prefix
     * @returns {morph.EnumDeclarationStructure} Created Typescript enum declaration
     * @memberof ActionFunction
     */
    private createEnumDeclaration(
        prefix: string
    ): morph.EnumDeclarationStructure {
        let result = this.createEnum(prefix);

        result.members?.push(
            this.createEnumField("name", this.sanitizeTarget(this.name), true)
        );

        if (this.definition.params) {
            for (const [key, _] of this.definition.params) {
                const fieldName = "param" + this.sanitizeName(key);
                result.members?.push(
                    this.createEnumField(fieldName, key, true)
                );
            }
        }

        return result;
    }

    /**
     * Creates the Typescript interface declaration.
     *
     * @private
     * @param {string} prefix Kind prefix
     * @param {Entity[]} types Scoped types for parameter resolution
     * @returns {(morph.InterfaceDeclarationStructure | undefined)} Created Typescript interface declaration
     * @memberof ActionFunction
     */
    private createInterfaceDeclaration(
        prefix: string,
        types: Entity[]
    ): morph.InterfaceDeclarationStructure | undefined {
        let result: morph.InterfaceDeclarationStructure | undefined = undefined;

        if (this.definition.params && this.definition.params.size > 0) {
            result = this.createInterface(prefix, "Params");

            for (const [key, value] of this.definition.params) {
                if (this.isTypeRef(value.type)) {
                    const typeRef = value.type as IRef;
                    const entity = types.find(
                        t => t.getModelName() === typeRef.ref[0]
                    );

                    if (entity) {
                        const element = entity.getElement(typeRef.ref[1]);
                        if (element) {
                            result.properties?.push(
                                this.createInterfaceField(
                                    key,
                                    element
                                ) as morph.PropertySignatureStructure
                            );
                        }
                    }
                } else {
                    result.properties?.push({
                        name: key,
                        type: this.cdsTypeToType(value.type),
                    });
                }
            }
        }

        return result;
    }

    /**
     * Type guard for a action/function parameter type.
     *
     * @private
     * @param {(CDSType | IRef)} type Type of the parameter
     * @returns {type is IRef} Flag, whether the given parameter type is a ref
     * @memberof ActionFunction
     */
    private isTypeRef(type: CDSType | IRef): type is IRef {
        return (type as IRef).ref !== undefined;
    }
}
