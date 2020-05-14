import _ from "lodash";
import {
    IService,
    IDefinition,
    CDSKind,
    IElement,
    CDSCardinality,
    IEnumValue,
    IParamType,
    Managed,
    IParsed,
    INamespace,
    CDSType,
} from "./utils/cds";

/**
 * Parses a compiled CDS JSON object.
 *
 * @export
 * @class CDSParser
 */
export class CDSParser {
    /**
     *
     *
     * @private
     * @type {string[]}
     * @memberof CDSParser
     */
    private services: IService[] = [];
    private namespaces: INamespace[] = [];
    private definitions: Map<string, IDefinition> = new Map<
        string,
        IDefinition
    >();

    /**
     * Parses a given service object to a service.
     *
     * @param {*} obj Object to parse
     * @returns {IService} Parsed service
     * @memberof CDSParser
     */
    public parse(obj: any): IParsed {
        for (const key in obj.definitions) {
            const value = obj.definitions[key];
            if (this.isValid(key, value)) {
                if (value.kind === CDSKind.service) {
                    this.addService(key);

                    continue;
                }

                let definitions = this.getDefinitions(key);

                const elements = this.parseElements(value);
                const _enum = this.parseEnum(value);
                const params = this.parseParams(value);

                definitions.set(key, {
                    kind: value.kind,
                    type: value.type,
                    includes: value.includes ? value.includes : undefined,
                    elements: elements.size <= 0 ? undefined : elements,
                    enum: _enum.size <= 0 ? undefined : _enum,
                    params: params.size <= 0 ? undefined : params,
                });
            }
        }

        return {
            services: this.services,
            namespaces: this.namespaces,
            definitions: this.definitions,
        };
    }

    /**
     * Parses elements from a entity.
     *
     * @private
     * @param {*} obj Object to parse from
     * @returns {Map<string, IElement>} Parsed elements
     * @memberof CDSParser
     */
    private parseElements(obj: any): Map<string, IElement> {
        let result: Map<string, IElement> = new Map<string, IElement>();

        if (obj.elements) {
            for (const key in obj.elements) {
                if (obj.elements.hasOwnProperty(key)) {
                    const value = obj.elements[key];

                    if (this.isLocalizationField(value)) continue;

                    const _enum = this.parseEnum(value);

                    let isArray = false;
                    if (!value.type) {
                        value.type = value.items.type;
                        isArray = true;
                    }

                    let canBeNull =
                        value["@Core.Computed"] ||
                        value["@Core.Immutable"] ||
                        value.virtual ||
                        value.default
                            ? true
                            : false ||
                              key === Managed.CreatedAt ||
                              key === Managed.CreatedBy ||
                              key === Managed.ModifiedAt ||
                              key === Managed.ModifiedBy;

                    result.set(key, {
                        type: value.type,
                        isArray: isArray,
                        canBeNull: canBeNull,
                        cardinality:
                            value.cardinality !== undefined
                                ? value.cardinality
                                : { max: CDSCardinality.one },
                        target: value.target,
                        enum: _enum.size <= 0 ? undefined : _enum,
                        keys: value.keys,
                    });
                }
            }
        }

        return result;
    }

    /**
     * Parses a enum.
     *
     * @private
     * @param {*} obj Object to parse from
     * @returns {Map<string, IEnumValue>} Parsed enum values
     * @memberof CDSParser
     */
    private parseEnum(obj: any): Map<string, IEnumValue> {
        let result = new Map<string, IEnumValue>();

        if (obj.enum) {
            for (const key in obj.enum) {
                if (obj.enum.hasOwnProperty(key)) {
                    const value = obj.enum[key];
                    result.set(key, value);
                }
            }
        }

        return result;
    }

    /**
     * Parses function and action import parameters
     *
     * @private
     * @param {*} obj Object to parse from
     * @returns {Map<string, IParamType>} Parsed parameters
     * @memberof CDSParser
     */
    private parseParams(obj: any): Map<string, IParamType> {
        let result: Map<string, IParamType> = new Map<string, IParamType>();

        if (obj.params) {
            for (const key in obj.params) {
                if (obj.params.hasOwnProperty(key)) {
                    const value = obj.params[key];
                    result.set(key, value as IParamType);
                }
            }
        }

        return result;
    }

    private isValid(key: string, value: any): boolean {
        if (
            value.kind !== CDSKind.entity &&
            value.kind !== CDSKind.type &&
            value.kind !== CDSKind.function &&
            value.kind !== CDSKind.action &&
            value.kind !== CDSKind.service
        )
            return false;

        if (value.type === CDSType.association) return false;

        if (key.includes("_texts") || key.startsWith("localized."))
            return false;

        return true;
    }

    private isLocalizationField(obj: any): boolean {
        let result = false;

        if (obj && obj.target) {
            const target = obj.target as string;
            result = target.includes("_texts");
        }

        return result;
    }

    private addService(name: string): void {
        const service: IService = {
            name: name,
            definitions: new Map<string, IDefinition>(),
        };

        this.services.push(service);
    }

    private addNamespace(name: string): INamespace {
        const namespace: INamespace = {
            name: name,
            definitions: new Map<string, IDefinition>(),
        };

        this.namespaces.push(namespace);

        return namespace;
    }

    private getDefinitions(key: string): Map<string, IDefinition> {
        const service = this.services.find(s => key.includes(s.name));
        if (service) {
            return service.definitions;
        }

        const namespace = this.namespaces.find(n => key.includes(n.name));
        if (namespace) {
            return namespace.definitions;
        } else {
            const split = key.split(".");
            if (split.length > 1) {
                const entity = _.last(split);
                const name = key.replace(`.${entity}`, "");

                return this.addNamespace(name).definitions;
            } else {
                return this.definitions;
            }
        }
    }
}
