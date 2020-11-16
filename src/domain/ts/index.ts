import { Option } from "fp-ts/lib/Option";
import * as cds from "../cds/core";

/**
 * Parsed CDS element.
 *
 * Will be used by entities and structured types.
 *
 * @export
 * @interface Element
 */
export interface Element {
    readonly type: cds.Type;
    readonly optional: boolean;
    readonly cardinality: Option<{ readonly max: cds.Cardinality }>;
    readonly target: Option<string>;
    readonly enum: Option<ReadonlyMap<string, cds.Value>>;
    readonly keys: Option<ReadonlyArray<cds.Reference>>;
}

/**
 * Parsed action return type.
 *
 * @export
 * @interface ReturnType
 */
export interface ReturnType {
    readonly type: cds.Type;
    readonly isArray: boolean;
}

/**
 * Parsed type alias.
 *
 * @export
 * @interface TypeAlias
 */
export interface TypeAlias {
    readonly kind: cds.Kind;
    readonly type: Option<cds.Type>;
    readonly elements: Option<ReadonlyMap<string, Element>>;
    readonly isArray: boolean;
}

/**
 * Parsed enum definition.
 *
 * @export
 * @interface Enum
 */
export interface Enum {
    readonly kind: cds.Kind;
    readonly type: cds.Type;
    readonly enum: Option<ReadonlyMap<string, cds.Value>>;
}

/**
 * Parsed action definition.
 *
 * @export
 * @interface Action
 */
export interface Action {
    readonly kind: cds.Kind;
    readonly params: Option<ReadonlyMap<string, cds.Parameter>>;
    readonly returns: Option<ReturnType>;
}

/**
 * Parsed entity definition.
 *
 * @export
 * @interface Entity
 */
export interface Entity {
    readonly kind: cds.Kind;
    readonly includes?: ReadonlyArray<string>;
    readonly elements?: ReadonlyMap<string, Element>;
    readonly actions?: ReadonlyMap<string, Action>;
}

/**
 * Parsed CDS definition.
 */
export type Definition = Entity | Action | Enum | TypeAlias;

/**
 * Parsed CDS namespace definition.
 *
 * @export
 * @interface Namespace
 */
export interface Namespace {
    readonly name: string;
    readonly definitions: ReadonlyMap<string, Definition>;
}

/**
 * Parsed CDS definition.
 *
 * @export
 * @interface Parsed
 */
export interface Parsed {
    readonly namespaces: Option<ReadonlyArray<Namespace>>;
    readonly definitions: Option<ReadonlyMap<string, Definition>>;
}

/**
 * Definitions namespace.
 */
export const Definitions = {
    /**
     * isTypeAlias :: Definition -> Boolean
     *
     * @param {Definition} def Definition to check
     * @returns {def is TypeAlias} Flag, whether the definition is a type alias
     */
    isTypeAlias: (def: Definition): def is TypeAlias =>
        def.kind === cds.Kind.Type &&
        ((def as TypeAlias).type !== undefined || (def as TypeAlias).elements !== undefined) &&
        (def as TypeAlias).isArray !== undefined,

    /**
     * isEntity :: Definition -> Boolean
     *
     * @param {Definition} def Definition to check
     * @returns {def is Entity} Flag, whether the definition is a entity
     */
    isEntity: (def: Definition): def is Entity =>
        def.kind === cds.Kind.Entity || (def.kind === cds.Kind.Type && (def as Enum).enum === undefined),

    /**
     * isEnum :: Definition -> Boolean
     *
     * @param {Definition} def Definition to check
     * @returns {def is Enum} Flag, whether the definition is a enum
     */
    isEnum: (def: Definition): def is Enum => def.kind === cds.Kind.Type && (def as Enum).enum !== undefined,

    /**
     * isAction :: Definition -> Boolean
     *
     * @param {Definition} def Definition to check
     * @returns {def is Action} Flag, whether the definition is a action
     */
    isAction: (def: Definition): def is Action => def.kind === cds.Kind.Function || def.kind === cds.Kind.Action,
};
