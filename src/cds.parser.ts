import {
    Cardinality,
    ICsn,
    ICsnActionDefinition,
    ICsnDefinition,
    ICsnElement,
    ICsnEntityDefinition,
    ICsnEnumTypeDefinition,
    ICsnFunctionDefinition,
    ICsnParam,
    ICsnStructuredTypeDefinition,
    ICsnValue,
    Kind,
    Managed,
    Type,
    isActionDef,
    isEntityDef,
    isEnumTypeDef,
    isFunctionDef,
    isServiceDef,
    isTypeAliasDef,
    isReturnsSingle,
    isReturnsMulti,
    isTypeDef,
    isArrayTypeAliasDef,
    isStructuredTypeDef,
} from "./utils/cds.types";
import {
    Definition,
    IActionFunctionDefinition,
    IActionFunctionReturns,
    IElement,
    IEntityDefinition,
    IEnumDefinition,
    INamespace,
    IParsed,
    IService,
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
     * @param {ICsn} csn Compiled JSON CSN source
     * @return {IParsed} Parsed service
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
                if (isTypeDef(def)) {
                    if (isTypeAliasDef(def)) {
                    } else if (isArrayTypeAliasDef(def)) {
                    } else if (isStructuredTypeDef(def)) {
                        const parsedDef = this.parseEntityOrStructuredTypeDef(
                            name,
                            def
                        );

                        definitions.set(name, parsedDef);
                    } else if (isEnumTypeDef(def)) {
                        const parsedDef = this.parseEnumDef(def);

                        definitions.set(name, parsedDef);
                    }
                } else {
                    if (isEntityDef(def)) {
                        const parsedDef = this.parseEntityOrStructuredTypeDef(
                            name,
                            def
                        );

                        definitions.set(name, parsedDef);
                    } else if (isActionDef(def) || isFunctionDef(def)) {
                        const parsedDef = this.parseActionFunctionDef(def);

                        definitions.set(name, parsedDef);
                    }
                }
            }
        }

        return {
            services: this.services,
            namespaces: this.namespaces,
            definitions: this.definitions,
        };
    }

    /**
     * Parses a given entity or type definition.
     *
     * @private
     * @param {string} name Name of the entity or type to parse
     * @param {(ICsnEntityDefinition | ICsnStructuredTypeDefinition)} definition Definition of the entity or type to parse
     * @return {IEntityDefinition} Parsed entity definition
     * @memberof CDSParser
     */
    private parseEntityOrStructuredTypeDef(
        name: string,
        definition: ICsnEntityDefinition | ICsnStructuredTypeDefinition
    ): IEntityDefinition {
        return {
            kind: definition.kind,
            type: isTypeAliasDef(definition) ? definition.type : undefined,
            elements: this.parseElements(name, definition),
            actions: isEntityDef(definition)
                ? this.parseBoundActions(definition)
                : undefined,
            includes: isEntityDef(definition) ? definition.includes || [] : [],
        };
    }

    /**
     * Parses a given enum definition.
     *
     * @private
     * @param {ICsnEnumTypeDefinition} definition Enum definition to parse
     * @return {IEnumDefinition} Parsed enum definition.
     * @memberof CDSParser
     */
    private parseEnumDef(definition: ICsnEnumTypeDefinition): IEnumDefinition {
        return {
            kind: definition.kind,
            type: definition.type,
            enum: this.parseEnum(definition),
        };
    }

    /**
     * Parses a given action or function definition.
     *
     * @private
     * @param {(ICsnActionDefinition | ICsnFunctionDefinition)} definition Action or function definition to parse
     * @return {IActionFunctionDefinition} Parsed action or function definition
     * @memberof CDSParser
     */
    private parseActionFunctionDef(
        definition: ICsnActionDefinition | ICsnFunctionDefinition
    ): IActionFunctionDefinition {
        return {
            kind: definition.kind,
            params: this.parseParams(definition),
            returns: this.parseReturns(definition),
        };
    }

    /**
     * Parses elements from a entity.
     *
     * @private
     * @param {string} name Name of the entity to parse the elements from
     * @param {(ICsnEntityDefinition | ICsnStructuredTypeDefinition)} def Entity or type definition to parse the elements from
     * @return {Map<string, IElement>} Parsed elements
     * @memberof CDSParser
     */
    private parseElements(
        name: string,
        def: ICsnEntityDefinition | ICsnStructuredTypeDefinition
    ): Map<string, IElement> {
        let result: Map<string, IElement> = new Map<string, IElement>();

        if (def.elements) {
            for (const elementName in def.elements) {
                if (def.elements.hasOwnProperty(elementName)) {
                    const element = def.elements[elementName];

                    if (this.isLocalizationField(element)) continue;
                    if (!element.type) {
                        if (element.type === undefined) {
                            throw new Error(
                                `Unable to parse element '${elementName}' on entity '${name}'. It seems to be a CDS expression without a type definition, please add a type to it.`
                            );
                        }
                    }

                    const _enum = this.parseEnum(element);

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
     * Parses bound actions.
     *
     * @private
     * @param {ICsnEntityDefinition} def Entity definition to parse the bound actions from.
     * @returns {Map<string, IActionFunctionDefinition>} Parsed bound actions
     * @memberof CDSParser
     */
    private parseBoundActions(
        def: ICsnEntityDefinition
    ): Map<string, IActionFunctionDefinition> {
        let result: Map<string, IActionFunctionDefinition> = new Map<
            string,
            IActionFunctionDefinition
        >();

        if (def.actions) {
            for (const actionName in def.actions) {
                if (def.actions.hasOwnProperty(actionName)) {
                    const action = def.actions[actionName];

                    const parsedAction = this.parseActionFunctionDef(action);
                    result.set(actionName, parsedAction);
                }
            }
        }

        return result;
    }

    /**
     * Parses a enum.
     *
     * @private
     * @param {(ICsnEnumTypeDefinition | ICsnElement)} definition Enum definition to parse
     * @return {Map<string, ICsnValue>} Parsed enum values
     * @memberof CDSParser
     */
    private parseEnum(
        definition: ICsnEnumTypeDefinition | ICsnElement
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
     * @param {(ICsnActionDefinition | ICsnFunctionDefinition)} definition Action or function definition to parse
     * @return {Map<string, ICsnParam>} Parsed action or function parameters
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
     * Parses the return type of a given action or function.
     *
     * @private
     * @param {(ICsnActionDefinition | ICsnFunctionDefinition)} definition Action or function definition to parse
     * @returns {(IActionFunctionReturns | undefined)} Parsed action/function return (can be undefinied)
     * @memberof CDSParser
     */
    private parseReturns(
        definition: ICsnActionDefinition | ICsnFunctionDefinition
    ): IActionFunctionReturns | undefined {
        if (definition.returns) {
            if (isReturnsSingle(definition.returns)) {
                return {
                    type: definition.returns.type,
                    isArray: false,
                };
            } else if (isReturnsMulti(definition.returns)) {
                return {
                    type: definition.returns.items.type,
                    isArray: true,
                };
            }
        }

        return undefined;
    }

    /**
     * Checks if a definition is valid.
     *
     * @private
     * @param {string} name Name of the definition
     * @param {ICsnDefinition} value Value of the definition
     * @returns {boolean} Falg, whether the definition is valid or not
     * @memberof CDSParser
     */
    private isValid(name: string, value: ICsnDefinition): boolean {
        if (
            value.kind !== Kind.Entity &&
            value.kind !== Kind.Type &&
            value.kind !== Kind.Function &&
            value.kind !== Kind.Action &&
            value.kind !== Kind.Service
        )
            return false;

        if (isTypeAliasDef(value)) {
            if (value.type === Type.Association) return false;
        }

        if (name.includes("_texts") || name.startsWith("localized."))
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
     * @param {string} name Name of the definition to get correspondig definitions
     * @returns {Map<string, ICsnDefinition>} Found definitions
     * @memberof CDSParser
     */
    private getDefinitions(name: string): Map<string, Definition> {
        const service = this.services.find((s) => name.includes(s.name));
        if (service) {
            return service.definitions;
        }

        const namespace = this.namespaces.find((n) => name.includes(n.name));
        if (namespace) {
            return namespace.definitions;
        } else {
            const split = name.split(".");
            if (split.length > 1) {
                const entity = _.last(split);
                const namespaceName = name.replace(`.${entity}`, "");

                return this.addNamespace(namespaceName).definitions;
            } else {
                return this.definitions;
            }
        }
    }
}
