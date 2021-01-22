import { Option } from "fp-ts/lib/Option";
import { Elements, Enum, Kind, PrimitiveType, Reference } from "./core";

/**
 * CDS type alias.
 *
 * @export
 */
export type TypeAlias = {
    readonly kind: Kind;
    readonly type: PrimitiveType;
};

/**
 * Type items for a CDS array type alias.
 *
 * @export
 */
export type TypeItems = {
    readonly type: PrimitiveType | string;
};

/**
 * Element items for a CDS array type alias.
 *
 * @export
 */
export type ElementItems = {
    readonly elements: Elements;
};

/**
 * CDS items.
 */
export type Items = TypeItems | ElementItems;

/**
 * CDS array type alias.
 *
 * @export
 */
export type ArrayTypeAlias = {
    readonly kind: Kind;
    readonly items: TypeItems | ElementItems;
};

/**
 * CDS structured type definition.
 *
 * @export
 */
export type StructuredType = {
    readonly kind: Kind;
    readonly type: PrimitiveType;
    readonly elements: Option<Elements>;
    readonly target: Option<string>;
    readonly keys: Option<Reference>;
};

/**
 * CDS enum type definition.
 *
 * @export
 */
export type EnumType = {
    readonly kind: Kind;
    readonly type: PrimitiveType;
    readonly enum: Enum;
};

/**
 * CDS type definition.
 */
export type TypeDef = TypeAlias | ArrayTypeAlias | StructuredType | EnumType;
