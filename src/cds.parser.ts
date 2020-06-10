import {
    Cardinality,
    ICsn,
    ICsnActionDefinition,
    ICsnDefinition,
    ICsnElement,
    ICsnEntityDefinition,
    ICsnEnumDefinition,
    ICsnFunctionDefinition,
    ICsnParam,
    ICsnTypeDefinition,
    ICsnValue,
    Kind,
    Managed,
    Type,
    isActionDef,
    isEntityDef,
    isEnumDef,
    isFunctionDef,
    isServiceDef,
    isTypeDef,
} from "./utils/cds.types";
import {
    Definition,
    IActionFunctionDefinition,
    IElement,
    IEntityDefinition,
    IEnumDefinition,
    INamespace,
    IParsed,
    IService,
    isEntity,
} from "./utils/types";

import _ from "lodash";

/**
 * Parses a compiled CDS JSON object.
 *
 * @export
 * @class CDSParser
 */
export class CDSParser {
    /**
     * Parsed services.
     *
     * @private
     * @type {string[]}
     * @memberof CDSParser
     */
    private services: IService[] = [];

    /**
     * Parsed namespaces.
     *
     * @private
     * @type {INamespace[]}
     * @memberof CDSParser
     */
    private namespaces: INamespace[] = [];

    /**
     * Parsed global definitions.
     *
     * @private
     * @type {Map<string, Definition>}
     * @memberof CDSParser
     */
    private definitions: Map<string, Definition> = new Map<
        string,
        Definition
    >();

    /**
     * Parses a given compiled JSON representation of the CDS source.
     *
     * @param {*} obj Compiled JSON CDS source
     * @returns {IParsed} Parsed service
     * @memberof CDSParser
     */
    public parse(csn: ICsn): IParsed {
        for (const name in csn.definitions) {
            const def = csn.definitions[name];
            if (this.isValid(name, def)) {
                if (isServiceDef(def)) {
                    this.addService(name);

                    continue;
                }

                let definitions = this.getDefinitions(name);
                if (isEntityDef(def) || isTypeDef(def)) {
                    const parsedDef = this.parseEntityOrTypeDef(name, def);

                    definitions.set(name, parsedDef);
                } else if (isEnumDef(def)) {
                    const parsedDef = this.parseEnumDef(name, def);

                    definitions.set(name, parsedDef);
                } else if (isActionDef(def) || isFunctionDef(def)) {
                    const parsedDef = this.parseActionFunctionDef(name, def);

                    definitions.set(name, parsedDef);
                }
            }
        }

        return {
            services: this.services,
            namespaces: this.namespaces,
            definitions: this.definitions,
        };
    }

    private parseEntityOrTypeDef(
        name: string,
        definition: ICsnEntityDefinition | ICsnTypeDefinition
    ): IEntityDefinition {
        return {
            kind: definition.kind,
            type: isTypeDef(definition) ? definition.type : undefined,
            elements: this.parseElements(name, definition),
            includes: isEntityDef(definition) ? definition.includes || [] : [],
        };
    }

    private parseEnumDef(
        name: string,
        definition: ICsnEnumDefinition
    ): IEnumDefinition {
        return {
            kind: definition.kind,
            type: definition.type,
            enum: this.parseEnum(definition),
        };
    }

    private parseActionFunctionDef(
        name: string,
        definition: ICsnActionDefinition | ICsnFunctionDefinition
    ): IActionFunctionDefinition {
        return {
            kind: definition.kind,
            params: this.parseParams(definition),
        };
    }

    /**
     * Parses elements from a entity.
     *
     * @private
     * @param {string} name Entity name
     * @param {*} def Object to parse from
     * @returns {Map<string, IElement>} Parsed elements
     * @memberof CDSParser
     */
    private parseElements(
        name: string,
        def: ICsnEntityDefinition | ICsnTypeDefinition
    ): Map<string, IElement> {
        let result: Map<string, IElement> = new Map<string, IElement>();

        if (def.elements) {
            for (const elementName in def.elements) {
                if (def.elements.hasOwnProperty(elementName)) {
                    const element = def.elements[elementName];
                    if (this.isLocalizationField(element)) continue;

                    const _enum = this.parseEnum(element);

                    if (!element.type) {
                        if (element.type === undefined) {
                            throw new Error(
                                `Unable to parse element '${elementName}' on entity '${name}'. It seems to be a CDS expression without a type definition, please add a type to it.`
                            );
                        }
                    }

                    let canBeNull =
                        element["@Core.Computed"] ||
                        element["@Core.Immutable"] ||
                        element.virtual ||
                        element.default
                            ? true
                            : false ||
                              elementName === Managed.CreatedAt ||
                              elementName === Managed.CreatedBy ||
                              elementName === Managed.ModifiedAt ||
                              elementName === Managed.ModifiedBy;

                    result.set(elementName, {
                        type: element.type,
                        canBeNull: canBeNull,
                        cardinality: element.cardinality
                            ? element.cardinality
                            : { max: Cardinality.one },
                        target: element.target,
                        enum: _enum.size <= 0 ? undefined : _enum,
                        keys: element.keys,
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
     * @param {*} definition Object to parse from
     * @returns {Map<string, IEnumValue>} Parsed enum values
     * @memberof CDSParser
     */
    private parseEnum(
        definition: ICsnEnumDefinition | ICsnElement
    ): Map<string, ICsnValue> {
        let result = new Map<string, ICsnValue>();

        if (definition.enum) {
            for (const key in definition.enum) {
                if (definition.enum.hasOwnProperty(key)) {
                    const value = definition.enum[key];
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
     * @param {*} definition Object to parse from
     * @returns {Map<string, IParamType>} Parsed parameters
     * @memberof CDSParser
     */
    private parseParams(
        definition: ICsnActionDefinition | ICsnFunctionDefinition
    ): Map<string, ICsnParam> {
        let result: Map<string, ICsnParam> = new Map<string, ICsnParam>();

        if (definition.params) {
            for (const key in definition.params) {
                if (definition.params.hasOwnProperty(key)) {
                    const value = definition.params[key];
                    result.set(key, value as ICsnParam);
                }
            }
        }

        return result;
    }

    /**
     * Checks if a definition is valid.
     *
     * @private
     * @param {string} key Key of the definition
     * @param {*} value Value of the definition
     * @returns {boolean} Flag, whether the definition is valid
     * @memberof CDSParser
     */
    private isValid(key: string, value: ICsnDefinition): boolean {
        if (
            value.kind !== Kind.Entity &&
            value.kind !== Kind.Type &&
            value.kind !== Kind.Function &&
            value.kind !== Kind.Action &&
            value.kind !== Kind.Service
        )
            return false;

        if (isTypeDef(value)) {
            if (value.type === Type.Association) return false;
        }

        if (key.includes("_texts") || key.startsWith("localized."))
            return false;

        return true;
    }

    /**
     * Check if a given object is a localized field.
     *
     * @private
     * @param {*} obj Object that represents the field
     * @returns {boolean} Flag, whether it is a localized field or not
     * @memberof CDSParser
     */
    private isLocalizationField(obj: any): boolean {
        let result = false;

        if (obj && obj.target) {
            const target = obj.target as string;
            result = target.includes("_texts");
        }

        return result;
    }

    /**
     * Adds and creates a new service with a given name.
     *
     * @private
     * @param {string} name Name of the service to create
     * @returns {IService} Added and created service
     * @memberof CDSParser
     */
    private addService(name: string): IService {
        const service: IService = {
            name: name,
            definitions: new Map<string, Definition>(),
        };

        this.services.push(service);

        return service;
    }

    /**
     * Adds and creates a new namespace with a given name.
     *
     * @private
     * @param {string} name Name of the namespace to create
     * @returns {INamespace} Added and created namespace
     * @memberof CDSParser
     */
    private addNamespace(name: string): INamespace {
        const namespace: INamespace = {
            name: name,
            definitions: new Map<string, Definition>(),
        };

        this.namespaces.push(namespace);

        return namespace;
    }

    /**
     * Returns the definitions for given key.
     * The key can correspond to a service, namespace or the global scope.
     *
     * NOTE: It also creates a new namespace if the key includes one and it doesn't exist already.
     *
     * @private
     * @param {string} key Key of the definition to get correspondig definitions
     * @returns {Map<string, ICsnDefinition>} Found definitions
     * @memberof CDSParser
     */
    private getDefinitions(key: string): Map<string, Definition> {
        const service = this.services.find((s) => key.includes(s.name));
        if (service) {
            return service.definitions;
        }

        const namespace = this.namespaces.find((n) => key.includes(n.name));
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
