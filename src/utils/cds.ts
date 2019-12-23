/**
 * CDS Type.
 *
 * @enum {number}
 */
export enum CDSType {
    association = "cds.Association",
    uuid = "cds.UUID",
    boolean = "cds.Boolean",
    integer = "cds.Integer",
    integer64 = "cds.Integer64",
    decimal = "cds.Decimal",
    decimalFloat = "cds.DecimalFloat",
    double = "cds.Double",
    date = "cds.Date",
    time = "cds.Time",
    dateTime = "cds.DateTime",
    timestamp = "cds.Timestamp",
    string = "cds.String",
    binary = "cds.Binary",
    largeString = "cds.LargeString",
    largeBinary = "cds.LargeBinary",
    user = "User",
}

/**
 * CDS Kind.
 *
 * @enum {number}
 */
export enum CDSKind {
    type = "type",
    entity = "entity",
    function = "function",
    action = "action",
}

/**
 * CDS Cardinality.
 *
 * @enum {number}
 */
export enum CDSCardinality {
    many = "*",
    one = 1,
}

/**
 * Enum value.
 *
 * @export
 * @interface IEnumValue
 */
export interface IEnumValue {
    val: any;
}

/**
 * CDS function or action import parameter type.
 *
 * @export
 * @interface IParamType
 */
export interface IParamType {
    type: CDSType;
}

/**
 * CDS inline enum.
 *
 * @export
 * @interface IEnum
 */
export interface IEnum {
    type: CDSType;
    enum: Map<string, IEnumValue>;
}

/**
 * Element of a CDS entity.
 *
 * @interface IElement
 */
export interface IElement {
    type: CDSType;
    isArray: boolean;
    canBeNull: boolean;
    cardinality?: { max: CDSCardinality };
    target?: string;
    enum?: Map<string, IEnumValue>;
}

/**
 * Definition inside a CDS service.
 *
 * @interface IDefinition
 */
export interface IDefinition {
    kind: CDSKind;
    type: CDSType;
    includes?: string[];
    elements?: Map<string, IElement>;
    enum?: Map<string, IEnumValue>;
    params?: Map<string, IParamType>;
}

/**
 * CDS service definition.
 *
 * @interface IService
 */
export interface IService {
    name?: string;
    definitions: Map<string, IDefinition>;
}
