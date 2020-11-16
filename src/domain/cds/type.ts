import { Option } from "fp-ts/lib/Option";
import { Elements, Enum, Kind, PrimitiveType, Reference } from "./core";

/**
 * CDS type alias.
 *
 * @export
 * @interface TypeAlias
 */
export interface TypeAlias {
    readonly kind: Kind;
    readonly type: PrimitiveType;
}

/**
 * Type items for a CDS array type alias.
 *
 * @export
 * @interface TypeItems
 */
export interface TypeItems {
    readonly type: PrimitiveType | string;
}

/**
 * Element items for a CDS array type alias.
 *
 * @export
 * @interface ElementItems
 */
export interface ElementItems {
    readonly elements: Elements;
}

/**
 * CDS items.
 */
export type Items = TypeItems | ElementItems;

/**
 * CDS array type alias.
 *
 * @export
 * @interface ArrayTypeAlias
 */
export interface ArrayTypeAlias {
    readonly kind: Kind;
    readonly items: TypeItems | ElementItems;
}

/**
 * CDS structured type definition.
 *
 * @export
 * @interface StructuredType
 */
export interface StructuredType {
    readonly kind: Kind;
    readonly type: PrimitiveType;
    readonly elements: Option<Elements>;
    readonly target: Option<string>;
    readonly keys: Option<Reference>;
}

/**
 * CDS enum type definition.
 *
 * @export
 * @interface EnumType
 */
export interface EnumType {
    readonly kind: Kind;
    readonly type: PrimitiveType;
    readonly enum: Enum;
}

/**
 * CDS type definition.
 */
export type TypeDef = TypeAlias | ArrayTypeAlias | StructuredType | EnumType;
