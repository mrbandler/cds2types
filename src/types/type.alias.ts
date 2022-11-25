import * as morph from "ts-morph";

import { BaseType } from "./base.type";
import { IElement, ITypeAliasDefinition } from "../utils/types";
import { Type } from "../utils/cds.types";

/**
 * Type that represents a CDS type alias.
 *
 * @export
 * @class TypeAlias
 * @extends {(BaseType<Entity, morph.TypeAliasDeclarationStructure | undefined>)}
 */
export class TypeAlias extends BaseType<
    morph.TypeAliasDeclarationStructure | undefined
> {
    /**
     * Casted definition.
     *
     * @readonly
     * @private
     * @type {ITypeAliasDefinition}
     * @memberof TypeAlias
     */
    private get def(): ITypeAliasDefinition {
        return this.definition as ITypeAliasDefinition;
    }

    /**
     * Default constructor.
     *
     * @param {string} name Name of the type alias.
     * @param {ITypeAliasDefinition} definition CDS definition of the type alias
     * @param {string} [namespace] Namespace the type alias belongs to
     * @memberof TypeAlias
     */
    constructor(
        name: string,
        definition: ITypeAliasDefinition,
        namespace?: string
    ) {
        super(name, definition, undefined, namespace);
    }

    /**
     * Converts the type alias to a Typescript type alias.
     *
     * @param {Entity[]} types In scope types for type resolve
     * @returns {morph.TypeAliasDeclarationStructure | undefined} Generated Typescript type alias
     * @memberof TypeAlias
     */
    public toType(
        types: BaseType[]
    ): morph.TypeAliasDeclarationStructure | undefined {
        if (this.def.elements) {
            return this.toStructuredTypeAlias(this.def.elements, types);
        } else if (this.def.type) {
            return this.toTypeAlias(this.def.type, types);
        }

        return undefined;
    }

    /**
     * Converts the type alias to a Typescript type alias.
     *
     * @private
     * @param {(Type | string)} type Type of the type alias
     * @param {Entity[]} types In scoped types for type resolve
     * @returns {morph.TypeAliasDeclarationStructure} Generated Typescript type alias.
     * @memberof TypeAlias
     */
    private toTypeAlias(
        type: Type | string,
        types: BaseType[]
    ): morph.TypeAliasDeclarationStructure {
        type = this.resolveType(type, types);
        if (this.def.isArray) {
            type = `${type}[]`;
        }

        const name = this.sanitizeName(this.sanitizeTarget(this.name));
        return this.createTypeAlias(name, type);
    }

    /**
     * Converts a structured type alias to a Typescript type alias.
     *
     * @private
     * @param {Map<string, IElement>} elements Elements of the structure
     * @param {Entity[]} types In scope types for type resolve
     * @returns {morph.TypeAliasDeclarationStructure} Generated Typescript type alias.
     * @memberof TypeAlias
     */
    private toStructuredTypeAlias(
        elements: Map<string, IElement>,
        types: BaseType[]
    ): morph.TypeAliasDeclarationStructure {
        const interfaceName = this.sanitizeName(this.sanitizeTarget(this.name));
        const fields = Array.from(elements)
            .map(([key, value]) =>
                this.createInterfaceField(
                    key,
                    value,
                    types,
                    interfaceName,
                    this.prefix
                )
            )
            .map((f) => `${f.name}${f.hasQuestionToken ? "?" : ""}: ${f.type}`);

        let type = `{ ${fields.join(";\n")} }`;
        if (this.def.isArray) {
            type = `${type}[]`;
        }

        const name = this.sanitizeName(this.sanitizeTarget(this.name));
        return this.createTypeAlias(name, type);
    }
}
