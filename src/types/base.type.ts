import { IDefinition, IElement, CDSType, CDSCardinality } from "../utils/cds";
import { TypeToken } from "../utils/type.constants";

/**
 * Base type that represents a part of CDS domain.
 *
 * @export
 * @abstract
 * @class BaseType
 */
export abstract class BaseType {
    /**
     * Interface prefix.
     *
     * @protected
     * @type {string}
     * @memberof BaseType
     */
    protected prefix: string;

    /**
     * Name of the entity.
     *
     * @private
     * @type {string}
     * @memberof Entity
     */
    protected name: string;

    /**
     * CDS definition which represents the entity.
     *
     * @private
     * @type {IDefinition}
     * @memberof Entity
     */
    protected definition: IDefinition;

    /**
     * Default constructor.
     * @param {string} name Name of the entity
     * @param {IDefinition} definition CDS entity definition
     * @memberof BaseType
     */
    constructor(name: string, definition: IDefinition, prefix: string = "") {
        this.prefix = prefix;
        this.name = name;
        this.definition = definition;
    }

    /**
     * To Typescript type.
     *
     * @abstract
     * @returns {string}
     * @memberof BaseType
     */
    public abstract toType(): string;

    /**
     * Creates a interface declaration.
     *
     * @protected
     * @param {string} name Name of the interface
     * @param {string} [prefix=""] Prefix of the interface
     * @returns {string} Create interface declaration
     * @memberof BaseType
     */
    protected createInterface(): string {
        const sanitizedName = this.sanitizeName(this.sanitizeTarget(this.name));
        return `${TypeToken.export} ${TypeToken.interface} ${this.prefix}${sanitizedName} ${TypeToken.curlyBraceLeft}`;
    }

    /**
     * Creates a interface field declaration.
     *
     * @protected
     * @param {string} name Name of the field
     * @param {IElement} element CDS element which represents the field
     * @param {string} [prefix=""] Prefix of interfaces
     * @returns {string} Created interface field declaration
     * @memberof BaseType
     */
    protected createInterfaceField(
        name: string,
        element: IElement,
        prefix: string = ""
    ): string {
        let fieldName =
            element.canBeNull || element.type === CDSType.association
                ? `${name}?`
                : name;

        let fieldType = "unknown";
        if (element.enum) {
            fieldType =
                this.sanitizeName(this.sanitizeTarget(this.name)) +
                this.sanitizeName(name);
        } else {
            fieldType = this.cdsElementToType(element, prefix);
        }

        return `    ${fieldName}${TypeToken.colon} ${fieldType}${TypeToken.semiColon}`;
    }

    /**
     * Creates a enum declaration.
     *
     * @protected
     * @returns {string} Created enum declaration
     * @memberof BaseType
     */
    protected createEnum(prefix: string = ""): string {
        const name = prefix + this.sanitizeName(this.sanitizeTarget(this.name));
        return `${TypeToken.export} ${TypeToken.enum} ${name} ${TypeToken.curlyBraceLeft}`;
    }

    /**
     * Creates a enum field declaration.
     *
     * @protected
     * @param {string} name Name of the field
     * @param {unknown} value Value of the field
     * @returns {string}
     * @memberof BaseType
     */
    protected createEnumField(
        name: string,
        value: unknown,
        isStringType: boolean
    ): string {
        if (value) {
            const fieldValue = isStringType ? `"${value}"` : `${value}`;
            return `    ${name} ${TypeToken.equals} ${fieldValue}${TypeToken.comma}`;
        } else {
            return `    ${name}${TypeToken.comma}`;
        }
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
        const parts = target.split(".");
        return parts[parts.length - 1];
    }

    /**
     * Converts a given element to a Typescript type.
     *
     * @protected
     * @param {IElement} element
     * @param {string} [prefix=""]
     * @returns {string}
     * @memberof BaseType
     */
    protected cdsElementToType(element: IElement, prefix: string = ""): string {
        let result: string = "unknown";

        switch (element.type) {
            case CDSType.association:
                if (element.target && element.cardinality) {
                    const target = this.sanitizeTarget(element.target);
                    let suffix = "";
                    if (element.cardinality.max === CDSCardinality.many) {
                        suffix = `${TypeToken.squareBracketsLeft}${TypeToken.squareBracketsRight}`;
                    }

                    result = prefix + target + suffix;
                }
                break;

            case CDSType.uuid:
                result = "string";
                break;

            case CDSType.string:
                result = "string";
                break;

            case CDSType.largeString:
                result = "string";
                break;

            case CDSType.user:
                result = "string";
                break;

            case CDSType.boolean:
                result = "boolean";
                break;

            case CDSType.integer:
                result = "number";
                break;

            case CDSType.integer64:
                result = "number";
                break;

            case CDSType.decimal:
                result = "number";
                break;

            case CDSType.decimalFloat:
                result = "number";
                break;

            case CDSType.decimalFloat:
                result = "number";
                break;

            case CDSType.double:
                result = "number";
                break;

            case CDSType.date:
                result = "Date";
                break;

            case CDSType.time:
                result = "Date";
                break;

            case CDSType.dateTime:
                result = "Date";
                break;

            case CDSType.timestamp:
                result = "Date";
                break;

            case CDSType.binary:
                result = "Buffer";
                break;

            case CDSType.largeBinary:
                result = "Buffer";
                break;
        }

        if (element.type !== CDSType.association && element.isArray) {
            result = `${result}${TypeToken.squareBracketsLeft}${TypeToken.squareBracketsRight}`;
        }

        return result;
    }
}
