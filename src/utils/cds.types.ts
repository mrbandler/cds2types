export enum Managed {
    CreatedAt = "createdAt",
    CreatedBy = "createdBy",
    ModifiedAt = "modifiedAt",
    ModifiedBy = "modifiedBy",
}

export enum Type {
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
    User = "User",
}

export enum Kind {
    Service = "service",
    Entity = "entity",
    Type = "type",
    Function = "function",
    Action = "action",
    Association = "cds.Association",
}

export enum Cardinality {
    many = "*",
    one = 1,
}

export interface ICsnServiceDefinition {
    "@source": string;
    kind: Kind;
    "@path": string;
}

export interface ICsnCardinality {
    max: Cardinality;
}

export interface ICsnKeys {
    ref: string[];
}

export interface ICsnValue {
    val: unknown;
}

export interface ICsnElement {
    type: Type;
    key?: boolean;
    target?: string;
    keys?: ICsnKeys[];
    cardinality?: ICsnCardinality;
    virtual?: boolean;
    default?: ICsnValue;
    enum?: IEnum;
    "@Core.Immutable"?: boolean;
    "@Core.Computed"?: boolean;
}

export interface ICsnElements {
    [name: string]: ICsnElement;
}

export interface ICsnActions {
    [name: string]: ICsnActionDefinition | ICsnFunctionDefinition;
}

export interface ICsnEntityDefinition {
    kind: Kind;
    "@readonly": boolean;
    elements: ICsnElements;
    actions?: ICsnActions;
    includes?: string[];
}

export interface ICsnTypeDefinition {
    kind: Kind;
    type: Type;
    elements?: ICsnElements;
    target?: string;
    keys?: ICsnKeys;
}

export interface IEnum {
    [name: string]: ICsnValue;
}

export interface ICsnEnumDefinition {
    kind: Kind;
    type: Type;
    enum: IEnum;
}

export interface ICsnTypeRef {
    ref: string[];
}

export interface ICsnParam {
    type: Type | ICsnTypeRef;
}

export interface ICsnParams {
    [name: string]: ICsnParam;
}

export interface ICsnActionDefinition {
    kind: Kind;
    params?: ICsnParams;
    returns?: CsnReturns;
}

export interface ICsnReturnsSingle {
    type: Type | string;
}

export interface ICsnReturnsMulti {
    items: ICsnReturnsSingle;
}

export type CsnReturns = ICsnReturnsSingle | ICsnReturnsMulti;

export interface ICsnFunctionDefinition {
    kind: Kind;
    params?: ICsnParams;
    returns?: CsnReturns;
}

export type ICsnDefinition =
    | ICsnServiceDefinition
    | ICsnEntityDefinition
    | ICsnTypeDefinition
    | ICsnEnumDefinition
    | ICsnActionDefinition
    | ICsnFunctionDefinition;

export interface ICsnDefinitions {
    [name: string]: ICsnDefinition;
}

export interface ICsn {
    definitions: ICsnDefinitions;
}

export function isServiceDef(
    definition: ICsnDefinition
): definition is ICsnServiceDefinition {
    return definition.kind === Kind.Service;
}

export function isEntityDef(
    definition: ICsnDefinition
): definition is ICsnEntityDefinition {
    return definition.kind === Kind.Entity;
}

export function isTypeDef(
    definition: ICsnDefinition
): definition is ICsnTypeDefinition {
    return (
        definition.kind === Kind.Type &&
        (definition as ICsnEnumDefinition).enum === undefined
    );
}

export function isEnumDef(
    definition: ICsnDefinition
): definition is ICsnEnumDefinition {
    return (
        definition.kind === Kind.Type &&
        (definition as ICsnEnumDefinition).enum !== undefined
    );
}

export function isActionDef(
    definition: ICsnDefinition
): definition is ICsnActionDefinition {
    return definition.kind === Kind.Action;
}

export function isFunctionDef(
    definition: ICsnDefinition
): definition is ICsnFunctionDefinition {
    return definition.kind === Kind.Function;
}

export function isReturnsSingle(
    returns: CsnReturns
): returns is ICsnReturnsSingle {
    return (returns as ICsnReturnsMulti).items === undefined;
}

export function isReturnsMulti(
    returns: CsnReturns
): returns is ICsnReturnsMulti {
    return (returns as ICsnReturnsMulti).items !== undefined;
}

export function isTypeRef(type: Type | ICsnTypeRef): type is ICsnTypeRef {
    return (type as ICsnTypeRef).ref !== undefined;
}

export function isType(type: Type | string): type is Type {
    var values = Object.keys(Type).map((k) => Type[k as string]);
    return values.includes(type);
}
