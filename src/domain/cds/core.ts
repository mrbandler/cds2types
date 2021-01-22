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
 */
export type Value = {
    readonly val: unknown;
};

/**
 * CDS key references.
 *
 * @export
 */
export type Reference = {
    readonly ref: ReadonlyArray<string>;
};

/**
 * CDS enum definition.
 *
 * @export
 */
export type Enum = {
    readonly [name: string]: Value;
};

/**
 * CDS element.
 *
 * @export
 */
export type Element = {
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
};

/**
 * CDS elements.
 *
 * @export
 */
export type Elements = {
    readonly [name: string]: Element;
};

/**
 * CDS single return type.
 *
 * @export
 */
export type SingleReturnType = {
    readonly type: PrimitiveType | string;
};

/**
 * CDS array return type.
 *
 * @export
 */
export type ArrayReturnType = {
    readonly items: SingleReturnType;
};

/**
 * CDS action/function return type.
 */
export type ReturnType = SingleReturnType | ArrayReturnType;

/**
 * CDS action/function parameter.
 *
 * @export
 */
export type Parameter = {
    readonly type: PrimitiveType | Reference;
};

/**
 * CDS action/function parameters.
 *
 * @export
 */
export type Parameters = {
    readonly [name: string]: Parameter;
};
