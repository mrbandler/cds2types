import { Option } from "fp-ts/lib/Option";

/**
 * Managed CDS fields.
 *
 * @export
 * @enum {number}
 */
export enum Managed {
    CreatedAt = "createdAt",
    CreatedBy = "createdBy",
    ModifiedAt = "modifiedAt",
    ModifiedBy = "modifiedBy",
}

/**
 * Primitive CDS types.
 *
 * @export
 * @enum {number}
 */
export enum PrimitiveType {
    Association = "cds.Association",
    Composition = "cds.Composition",
    Uuid = "cds.UUID",
    Boolean = "cds.Boolean",
    Integer = "cds.Integer",
    Integer64 = "cds.Integer64",
    Decimal = "cds.Decimal",
    DecimalFloat = "cds.DecimalFloat",
    Double = "cds.Double",
    Date = "cds.Date",
    Time = "cds.Time",
    DateTime = "cds.DateTime",
    Timestamp = "cds.Timestamp",
    String = "cds.String",
    Binary = "cds.Binary",
    LargeString = "cds.LargeString",
    LargeBinary = "cds.LargeBinary",
}

/**
 * Definition kinds.
 *
 * @export
 * @enum {number}
 */
export enum Kind {
    Service = "service",
    Entity = "entity",
    Type = "type",
    Function = "function",
    Action = "action",
    Association = "cds.Association",
}

/**
 * Field cardinality.
 *
 * @export
 * @enum {number}
 */
export enum Cardinality {
    many = "*",
    one = 1,
}

/**
 * CDS type.
 */
export type Type = PrimitiveType | Reference | string;

/**
 * CDS value.
 *
 * @export
 * @interface Value
 */
export interface Value {
    readonly val: unknown;
}

/**
 * CDS key references.
 *
 * @export
 * @interface Keys
 */
export interface Reference {
    readonly ref: ReadonlyArray<string>;
}

/**
 * CDS enum definition.
 *
 * @export
 * @interface Enum
 */
export interface Enum {
    readonly [name: string]: Value;
}

/**
 * CDS element.
 *
 * @export
 * @interface Element
 */
export interface Element {
    readonly type: PrimitiveType;
    readonly key: Option<boolean>;
    readonly target: Option<string>;
    readonly keys: Option<ReadonlyArray<Reference>>;
    readonly cardinality: Option<Cardinality>;
    readonly virtual: Option<boolean>;
    readonly default: Option<Value>;
    readonly enum: Option<Enum>;
    readonly "@Core.Immutable": Option<boolean>;
    readonly "@Core.Computed": Option<boolean>;
}

/**
 * CDS elements.
 *
 * @export
 * @interface Elements
 */
export interface Elements {
    readonly [name: string]: Element;
}

/**
 * CDS single return type.
 *
 * @export
 * @interface SingleReturnType
 */
export interface SingleReturnType {
    readonly type: PrimitiveType | string;
}

/**
 * CDS array return type.
 *
 * @export
 * @interface ArrayReturnType
 */
export interface ArrayReturnType {
    readonly items: SingleReturnType;
}

/**
 * CDS action/function return type.
 */
export type ReturnType = SingleReturnType | ArrayReturnType;

/**
 * CDS action/function parameter.
 *
 * @export
 * @interface Parameter
 */
export interface Parameter {
    readonly type: PrimitiveType | Reference;
}

/**
 * CDS action/function parameters.
 *
 * @export
 * @interface Parameters
 */
export interface Parameters {
    readonly [name: string]: Parameter;
}
