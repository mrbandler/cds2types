import {
    IService,
    IDefinition,
    CDSKind,
    IElement,
    CDSCardinality,
    IEnumValue,
    IParamType,
} from "./utils/cds";

/**
 * Parses a compiled CDS JSON object.
 *
 * @export
 * @class CDSParser
 */
export class CDSParser {
    /**
     * Parses a given service object to a service.
     *
     * @param {*} obj Object to parse
     * @returns {IService} Parsed service
     * @memberof CDSParser
     */
    public parse(obj: any): IService {
        let definitions: Map<string, IDefinition> = new Map<
            string,
            IDefinition
        >();

        for (const key in obj.definitions) {
            const value = obj.definitions[key];
            if (
                value.kind !== CDSKind.entity &&
                value.kind !== CDSKind.type &&
                value.kind !== CDSKind.function &&
                value.kind !== CDSKind.action
            )
                continue;

            const elements = this.parseElements(value);
            const _enum = this.parseEnum(value);
            const params = this.parseParams(value);

            definitions.set(key, {
                kind: value.kind,
                type: value.type,
                elements: elements.size <= 0 ? undefined : elements,
                enum: _enum.size <= 0 ? undefined : _enum,
                params: params.size <= 0 ? undefined : params,
            });
        }

        return {
            definitions: definitions,
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
                    const _enum = this.parseEnum(value);

                    let isArray = false;
                    if (!value.type) {
                        value.type = value.items.type;
                        isArray = true;
                    }

                    let canBeNull =
                        value["@Core.Computed"] ||
                        value["@Core.Immutable"] ||
                        value.virtual;

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
}
