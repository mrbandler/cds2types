import * as morph from "ts-morph";
import _ from "lodash";

import { Cardinality, isType, Type } from "../utils/cds.types";
import { Definition, IElement } from "../utils/types";

/**
 * Base type that represents a part of CDS domain.
 *
 * @export
 * @abstract
 * @class BaseType
 * @template I Input type for the toType method
 * @template O Return type for the toType method
 */
export abstract class BaseType<O = unknown> {
    /**
     * Interface prefix.
     *
     * @protected
     * @type {string}
     * @memberof BaseType
     */
    protected prefix: string;

    /**
     * Namespace this type is confined in.
     *
     * @protected
     * @type {string}
     * @memberof BaseType
     */
    protected namespace: string;

    /**
     * Name of the type.
     *
     * @private
     * @type {string}
     * @memberof BaseType
     */
    protected name: string;

    public get Name(): string {
        return this.name;
    }

    /**
     * CDS definition which represents the type.
     *
     * @private
     * @type {IDefinition}
     * @memberof BaseType
     */
    protected definition: Definition;

    /**
     * Default constructor.
     *
     * @param {string} name Name of the type
     * @param {IDefinition} definition CDS type definition
     * @param {string} [prefix=""] Interface prefix
     * @param {string} [namespace=""] Namespace this type belongs to
     * @memberof BaseType
     */
    constructor(
        name: string,
        definition: Definition,
        prefix = "",
        namespace = ""
    ) {
        this.prefix = prefix;
        this.namespace = namespace;
        this.name = name;
        this.definition = definition;
    }

    /**
     * Generates the Typescript type code.
     *
     * @abstract
     * @param {BaseType[]} [types] Input type, for cross type resolution
     * @returns {O} Output type
     * @memberof BaseType
     */
    public abstract toType(types?: BaseType[]): O;

    /**
     * Returns the sanitized name of the entity.
     *
     * @returns {string} Sanitized name of the entity
     * @memberof BaseType
     */
    public getSanitizedName(withNamespace = false, withPrefix = false): string {
        let name = this.sanitizeName(this.sanitizeTarget(this.name));

        if (withPrefix && (this.prefix || this.prefix !== "")) {
            name = this.prefix + name;
        }

        if (withNamespace && (this.namespace || this.namespace !== "")) {
            name = this.namespace + "." + name;
        }

        return name;
    }

    /**
     * Creates a interface declaration.
     *
     * @protected
     * @param {string} [prefix=""] Name prefix
     * @param {string} [suffix=""] Name suffix
     * @param {string[]} [ext] Extension type names
     * @returns {morph.InterfaceDeclarationStructure} Created interface declaration
     * @memberof BaseType
     */
    protected createInterface(
        prefix = "",
        suffix = "",
        ext?: string[]
    ): morph.InterfaceDeclarationStructure {
        const sanitizedName = `${prefix}${this.sanitizeName(
            this.sanitizeTarget(this.name)
        )}${suffix}`;

        return {
            kind: morph.StructureKind.Interface,
            name: this.prefix + sanitizedName,
            extends: ext,
            properties: [],
            isExported: true,
        };
    }

    /**
     * Creates a interface field declaration.
     *
     * @protected
     * @param {string} name Name of the field
     * @param {IElement} element CDS element which represents the field
     * @param {string} [prefix=""] Prefix of interfaces
     * @returns {morph.InterfaPropertySignatureStructureceMemberStructures} Created interface field declaration
     * @memberof BaseType
     */
    protected createInterfaceField(
        name: string,
        element: IElement,
        types: BaseType[],
        prefix = ""
    ): morph.PropertySignatureStructure {
        const fieldName =
            element.canBeNull || element.type === Type.Association
                ? `${name}?`
                : name;

        let fieldType = "unknown";
        if (element.enum) {
            fieldType =
                this.sanitizeName(this.sanitizeTarget(this.name)) +
                this.sanitizeName(name);
        } else {
            fieldType = this.cdsElementToType(element, types, prefix);
        }

        return {
            kind: morph.StructureKind.PropertySignature,
            name: fieldName,
            type: fieldType,
        };
    }

    /**
     * Creates a enum declaration.
     *
     * @protected
     * @param {string} [prefix=""] Name prefix
     * @returns {morph.EnumDeclarationStructure} Created enum declaration
     * @memberof BaseType
     */
    protected createEnum(prefix = ""): morph.EnumDeclarationStructure {
        const name = prefix + this.sanitizeName(this.sanitizeTarget(this.name));

        return {
            kind: morph.StructureKind.Enum,
            name: name,
            members: [],
            isExported: true,
        };
    }

    /**
     * Creates a enum field declaration.
     *
     * @protected
     * @param {string} name Name of the field
     * @param {unknown} value Value of the field
     * @param {boolean} isStringType Flag, whether the value is a string type
     * @returns {morph.EnumMemberStructure} Created enum field declaration
     * @memberof BaseType
     */
    protected createEnumField(
        name: string,
        value: unknown,
        isStringType: boolean
    ): morph.EnumMemberStructure {
        const fieldValue = (isStringType ? `${value}` : value) as undefined;

        return {
            kind: morph.StructureKind.EnumMember,
            name: name,
            value: value ? fieldValue : undefined,
        };
    }

    protected createTypeAlias(
        name: string,
        type: string
    ): morph.TypeAliasDeclarationStructure {
        return {
            kind: morph.StructureKind.TypeAlias,
            name: name,
            type: type,
            isExported: true,
        };
    }

    /**
     * Sanitizes a given name.
     *
     * @protected
     * @param {string} name Name to sanitize
     * @returns {string} Sanitized name
     * @memberof BaseType
     */
    protected sanitizeName(name: string): string {
        let result = name;

        if (/[a-z]/.test(name.substr(0, 1))) {
            result =
                name.substring(0, 1).toUpperCase() +
                name.substring(1, name.length);
        }

        if (name.includes(".")) {
            result = _.replace(_.startCase(name), new RegExp(" ", "g"), "");
        }

        return result;
    }

    /**
     * Sanitizes a given target.
     *
     * @protected
     * @param {string} target Target to sanitize
     * @returns {string} Sanitized target
     * @memberof BaseType
     */
    protected sanitizeTarget(target: string): string {
        return this.sanitizeName(this.getTarget(target));
    }

    /**
     * Return a target from a given target string
     *
     * @protected
     * @param {string} target Target to sanitize
     * @returns {string} Sanitized target
     * @memberof BaseType
     */
    protected getTarget(target: string): string {
        const parts = target.split(".");

        let result = target;

        if (_.last(parts) === "texts") {
            result = _.join(_.takeRight(parts, 2), ".");
        } else {
            result = parts[parts.length - 1];
        }

        return result;
    }

    /**
     *
     *
     * @protected
     * @param {string} target
     * @returns {string}
     * @memberof BaseType
     */
    protected getNamespace(target: string): string {
        const parts = target.split(".");
        parts.splice(parts.length - 1);
        return parts.join(".");
    }

    /**
     * Resolves a CDS type or a type reference to a entity.
     *
     * @protected
     * @param {(Type | string)} type Type to resolve
     * @param {Entity[]} types Types to resolve to if the type is a reference
     * @returns {string} Resolved type
     * @memberof BaseType
     */
    protected resolveType(type: Type | string, types: BaseType[]): string {
        let result = "unknown";

        if (isType(type)) {
            result = this.cdsTypeToType(type);
        } else {
            const found = types.find((t) => t.name === type);
            if (found) {
                result = found.getSanitizedName(true, true);

                if (this.namespace !== "" && result.includes(this.namespace)) {
                    result = result.replace(`${this.namespace}.`, "");
                }
            }
        }

        return result;
    }

    /**
     * Converts a CDS type to a Typescript type.
     *
     * @protected
     * @param {Type} type
     * @returns {string}
     * @memberof BaseType
     */
    protected cdsTypeToType(type: Type): string {
        let result = "unknown";

        switch (type) {
            case Type.Uuid:
                result = "string";
                break;

            case Type.String:
                result = "string";
                break;

            case Type.LargeString:
                result = "string";
                break;

            case Type.User:
                result = "string";
                break;

            case Type.Boolean:
                result = "boolean";
                break;

            case Type.Integer:
                result = "number";
                break;

            case Type.Integer64:
                result = "number";
                break;

            case Type.Decimal:
                result = "number";
                break;

            case Type.DecimalFloat:
                result = "number";
                break;

            case Type.DecimalFloat:
                result = "number";
                break;

            case Type.Double:
                result = "number";
                break;

            case Type.Date:
                result = "Date";
                break;

            case Type.Time:
                result = "Date";
                break;

            case Type.DateTime:
                result = "Date";
                break;

            case Type.Timestamp:
                result = "Date";
                break;

            case Type.Binary:
                result = "Buffer";
                break;

            case Type.LargeBinary:
                result = "Buffer";
                break;
        }

        return result;
    }

    /**
     * Converts a given element to a Typescript type.
     *
     * @protected
     * @param {IElement} element Element to convert to a type declaration
     * @param {string} [prefix=""] Prefix of the type declaration
     * @returns {string} Created type declaration
     * @memberof BaseType
     */
    protected cdsElementToType(
        element: IElement,
        types: BaseType[],
        prefix = ""
    ): string {
        let result = "unknown";

        switch (element.type) {
            case Type.Association:
                result = this.resolveTargetType(element, prefix);

                break;

            case Type.Composition:
                result = this.resolveTargetType(element, prefix);

                break;

            default:
                if (element.target) {
                    result = this.resolveTargetType(element, prefix);
                } else {
                    result = this.resolveType(element.type, types);
                    if (
                        element.cardinality &&
                        element.cardinality.max === Cardinality.many
                    ) {
                        result = `${result}[]`;
                    }
                }

                break;
        }

        return result;
    }

    protected resolveTargetType(element: IElement, prefix = ""): string {
        let result = "";

        if (element && element.target && element.cardinality) {
            let target = "";
            if (element.target.includes(this.namespace)) {
                target = prefix + this.sanitizeTarget(element.target);
            } else {
                target =
                    this.getNamespace(element.target) +
                    "." +
                    prefix +
                    this.sanitizeTarget(element.target);
            }

            let suffix = "";
            if (element.cardinality.max === Cardinality.many) {
                suffix = "[]";
            }

            result = target + suffix;
        }

        return result;
    }
}
