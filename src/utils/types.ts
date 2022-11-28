import {
    Cardinality,
    ICsnKeys,
    ICsnParam,
    ICsnValue,
    Kind,
    Type,
} from "./cds.types";

/**
 * CDS inline enum.
 *
 * @export
 * @interface IEnum
 */
export interface IEnum {
    type: Type;
    enum: Map<string, ICsnValue>;
}

/**
 * Element of a CDS entity.
 *
 * @interface IElement
 */
export interface IElement {
    type: Type | string;
    canBeNull: boolean;
    cardinality?: { max: Cardinality };
    target?: string;
    enum?: Map<string, ICsnValue>;
    keys?: ICsnKeys[];
}

export interface KindName {
    kind: string | undefined;
    name: string;
}

/**
 * Definition inside a CDS service.
 *
 * @interface IDefinition
 */
export interface IEntityDefinition {
    kind: Kind;
    type?: Type;
    includes?: string[];
    elements?: Map<string, IElement>;
    actions?: Map<string, IActionFunctionDefinition>;
}

export interface IEnumDefinition {
    kind: Kind;
    type: Type;
    enum?: Map<string, ICsnValue>;
}

export interface IActionFunctionReturns {
    type: Type | string;
    isArray: boolean;
}

export interface IActionFunctionDefinition {
    kind: Kind;
    params?: Map<string, ICsnParam | ITypeAliasDefinition>;
    returns?: IActionFunctionReturns;
}

export interface ITypeAliasDefinition {
    kind: Kind;
    type?: Type | string;
    elements?: Map<string, IElement>;
    isArray: boolean;
}

export type Definition =
    | undefined
    | ITypeAliasDefinition
    | IEntityDefinition
    | IEnumDefinition
    | IActionFunctionDefinition;

/**
 * CDS namespaces.
 *
 * @export
 * @interface INamespace
 */
export interface INamespace {
    name: string;
    definitions: Map<string, Definition>;
}

/**
 * CDS service definition.
 *
 * @interface IService
 */
export interface IService {
    name: string;
    definitions: Map<string, Definition>;
}

/**
 * Parsed CDS source.
 *
 * @export
 * @interface IParsed
 */
export interface IParsed {
    services?: IService[];
    namespaces?: INamespace[];
    definitions?: Map<string, Definition>;
}

export function isType(
    definition: Definition
): definition is ITypeAliasDefinition {
    if (definition == undefined) return false;
    return (
        definition.kind === Kind.Type &&
        ((definition as ITypeAliasDefinition).type !== undefined ||
            (definition as ITypeAliasDefinition).elements !== undefined) &&
        (definition as ITypeAliasDefinition).isArray !== undefined
    );
}

export function isEntity(
    definition: Definition
): definition is IEntityDefinition {
    if (definition == undefined) return false;
    return (
        definition.kind === Kind.Entity ||
        (definition.kind === Kind.Type &&
            (definition as IEnumDefinition).enum === undefined)
    );
}

export function isEnum(definition: Definition): definition is IEnumDefinition {
    if (definition == undefined) return false;
    return (
        definition.kind === Kind.Type &&
        (definition as IEnumDefinition).enum !== undefined
    );
}

export function isActionFunction(
    definition: Definition
): definition is IActionFunctionDefinition {
    if (definition == undefined) return false;
    return definition.kind === Kind.Function || definition.kind === Kind.Action;
}

/**
 * CLI options.
 *
 * @export
 * @interface IOptions
 */
export interface IOptions {
    cds: string;
    output: string;
    prefix: string;
    json: boolean;
    debug: boolean;
    version: string;
    format: boolean;
    sort: boolean;
}
