import * as morph from "ts-morph";

import { ICsnTypeRef, Kind, isTypeRef, Cardinality } from "../utils/cds.types";

import { BaseType } from "./base.type";
import { Entity } from "./entity";
import {
    IActionFunctionDefinition,
    ITypeAliasDefinition,
} from "../utils/types";

/**
 * Action/Function toType return type.
 *
 * @export
 * @interface IActionFunctionDeclarationStructure
 */
export interface IActionFunctionDeclarationStructure {
    enumDeclarationStructure: morph.EnumDeclarationStructure;
    interfaceDeclarationStructure?: morph.InterfaceDeclarationStructure;
    typeAliasDeclarationStructure?: morph.TypeAliasDeclarationStructure;
}

/**
 * Type that represents a CDS ActionFunction/action.
 *
 * @export
 * @class ActionFunction
 * @extends {BaseType}
 */
export class ActionFunction extends BaseType<IActionFunctionDeclarationStructure> {
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
    private kind: Kind;

    /**
     * Params of the action/ActionFunction.
     *
     * @private
     * @type {string[]}
     * @memberof ActionFunction
     */
    private params: string[] = [];

    /**
     * Returns the definition casted to a action/function definition.
     *
     * @readonly
     * @private
     * @type {IActionFunctionDefinition}
     * @memberof ActionFunction
     */
    private get def(): IActionFunctionDefinition {
        return this.definition as IActionFunctionDefinition;
    }

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
        definition: IActionFunctionDefinition,
        kind: Kind,
        interfacePrefix?: string,
        namespace?: string
    ) {
        super(name, definition, interfacePrefix, namespace);
        this.kind = kind;
        if (this.definition && this.def.params) {
            for (const [key] of this.def.params) {
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
    public toType(types: BaseType[]): IActionFunctionDeclarationStructure {
        const prefix =
            this.kind === Kind.Function ? this.FUNC_PREFIX : this.ACTION_PREFIX;

        return {
            enumDeclarationStructure: this.createEnumDeclaration(prefix, types),
            interfaceDeclarationStructure: this.createInterfaceDeclaration(
                prefix,
                types
            ),
            typeAliasDeclarationStructure: this.createTypeDeclaration(
                prefix,
                types
            ),
        };
    }

    /**
     * Determine prefix for bound entity actions.
     *
     * @private
     * @param {BaseType[]} types Scoped types for parameter resolution
     * @returns {string} Created type declaration
     * @memberof ActionFunction
     */
    private determineBoundEntityPrefix(
        types: BaseType[]
    ): string | undefined {
        const sanitizedNamespace = this.sanitizeName(
            this.sanitizeTarget(this.namespace)
        );
        const boundEntity =
            sanitizedNamespace !== this.namespace
                ? sanitizedNamespace
                : undefined;
        if (boundEntity) {
            return `${this.resolveType(boundEntity, types)}Actions`;
        }
        return boundEntity;
    }

    /**
     * Creates the Typescript enum declaration.
     *
     * @private
     * @param {string} prefix Kind prefix
     * @param {BaseType[]} types Scoped types for parameter resolution
     * @returns {morph.EnumDeclarationStructure} Created Typescript enum declaration
     * @memberof ActionFunction
     */
    private createEnumDeclaration(
        prefix: string,
        types: BaseType[]
    ): morph.EnumDeclarationStructure {
        const result = this.createEnum(prefix);
        const boundActionPrefix = this.determineBoundEntityPrefix(types);
        if (boundActionPrefix) {
            result.name = boundActionPrefix + result.name;
        }

        result.members?.push(
            this.createEnumField("name", this.getTarget(this.name), true)
        );

        if (this.def.params) {
            for (const [key] of this.def.params) {
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
     * @param {BaseType[]} types Scoped types for parameter resolution
     * @returns {(morph.InterfaceDeclarationStructure | undefined)} Created Typescript interface declaration
     * @memberof ActionFunction
     */
    private createInterfaceDeclaration(
        prefix: string,
        types: BaseType[]
    ): morph.InterfaceDeclarationStructure | undefined {
        let result: morph.InterfaceDeclarationStructure | undefined = undefined;

        if (this.def.params && this.def.params.size > 0) {
            result = this.createInterface(prefix, "Params");
            const interfaceName = this.sanitizeName(
                this.sanitizeTarget(this.name)
            );
            const boundActionPrefix = this.determineBoundEntityPrefix(types);
            if (boundActionPrefix) {
                result.name = boundActionPrefix + result.name;
            }

            for (const [key, value] of this.def.params) {
                if (isTypeRef(value.type as ICsnTypeRef)) {
                    const typeRef = value.type as ICsnTypeRef;
                    const type = types.find((t) => t.Name === typeRef.ref[0]);

                    if (type && type instanceof Entity) {
                        const element = type.getElement(typeRef.ref[1]);
                        if (element) {
                            result.properties?.push(
                                this.createInterfaceField(
                                    key,
                                    element,
                                    types,
                                    interfaceName
                                ) as morph.PropertySignatureStructure
                            );
                        }
                    }
                } else {
                    const type = this.cdsElementToType(
                        {
                            type: value.type as string,
                            canBeNull: false,
                            cardinality: (value as ITypeAliasDefinition).isArray
                                ? { max: Cardinality.many }
                                : { max: Cardinality.one },
                        },
                        types,
                        interfaceName
                    );
                    result.properties?.push({
                        name: key,
                        type: type,
                    });
                }
            }
        }

        return result;
    }

    /**
     * Creates the Typescript type alias declaration.
     *
     * @private
     * @param {string} prefix Kind prefix
     * @param {Entity[]} types Scoped types for returns resolution
     * @returns {(morph.TypeAliasDeclarationStructure | undefined)} Created Typescript type alias declaration
     * @memberof ActionFunction
     */
    private createTypeDeclaration(
        prefix: string,
        types: BaseType[]
    ): morph.TypeAliasDeclarationStructure | undefined {
        let result: morph.TypeAliasDeclarationStructure | undefined = undefined;

        if (this.def.returns) {
            const target = this.sanitizeTarget(this.name);
            let name = `${prefix}${this.sanitizeName(target)}Return`;
            const boundActionPrefix = this.determineBoundEntityPrefix(types);
            if (boundActionPrefix) {
                name = boundActionPrefix + name;
            }

            let type = this.resolveType(this.def.returns.type, types);
            if (this.def.returns.isArray) {
                type = `${type}[]`;
            }

            result = this.createTypeAlias(name, type);
        }

        return result;
    }
}
