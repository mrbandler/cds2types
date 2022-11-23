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
    HanaTinyint = "cds.hana.TINYINT",
}

export enum CommonType {
    CodeList = "sap.common.CodeList",
    Countries = "sap.common.Countries",
    Currencies = "sap.common.Currencies",
    Languages = "sap.common.Languages",
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
    items?: ICsnArrayTypeAliasTypeItems;
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

export interface ICsnStructuredTypeDefinition {
    kind: Kind;
    type: Type;
    elements?: ICsnElements;
    target?: string;
    keys?: ICsnKeys;
}

export interface ICsnTypeAliasDefinition {
    kind: Kind;
    type: Type;
}

export interface ICsnArrayTypeAliasTypeItems {
    type: Type | string;
}

export interface ICsnArrayTypeAliasElementItems {
    elements: ICsnElements;
}

export interface ICsnArrayTypeAliasDefinition {
    kind: Kind;
    items: ICsnArrayTypeAliasTypeItems | ICsnArrayTypeAliasElementItems;
}

export type ICsnTypeDefinition =
    | ICsnTypeAliasDefinition
    | ICsnArrayTypeAliasDefinition
    | ICsnStructuredTypeDefinition
    | ICsnEnumTypeDefinition;

export interface IEnum {
    [name: string]: ICsnValue;
}

export interface ICsnEnumTypeDefinition {
    kind: Kind;
    type: Type;
    enum: IEnum;
}

export interface ICsnTypeRef {
    ref: string[];
}

export interface ICsnArrayParam {
    items: ICsnParam;
}

export interface ICsnParam {
    type: Type | ICsnTypeRef;
}

export interface ICsnParams {
    [name: string]: ICsnParam;
}

export interface ICsnActionDefinition {
    kind: Kind;
    params?: ICsnParams | ICsnArrayParam;
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
    return definition.kind === Kind.Type;
}

export function isTypeAliasDef(
    definition: ICsnDefinition
): definition is ICsnTypeAliasDefinition {
    return (
        definition.kind === Kind.Type &&
        (definition as ICsnStructuredTypeDefinition).type !== undefined &&
        (definition as ICsnEnumTypeDefinition).enum === undefined
    );
}

export function isArrayTypeAliasDef(
    definition: ICsnDefinition
): definition is ICsnArrayTypeAliasDefinition {
    return (
        definition.kind === Kind.Type &&
        (definition as ICsnStructuredTypeDefinition).type === undefined &&
        (definition as ICsnArrayTypeAliasDefinition).items !== undefined
    );
}

export function isArrayTypeAliasTypeItems(
    items: ICsnArrayTypeAliasTypeItems | ICsnArrayTypeAliasElementItems
): items is ICsnArrayTypeAliasTypeItems {
    return (items as ICsnArrayTypeAliasTypeItems).type !== undefined;
}

export function isArrayTypeAliasElementItems(
    items: ICsnArrayTypeAliasTypeItems | ICsnArrayTypeAliasElementItems
): items is ICsnArrayTypeAliasElementItems {
    return (items as ICsnArrayTypeAliasElementItems).elements !== undefined;
}

export function isStructuredTypeDef(
    definition: ICsnDefinition
): definition is ICsnStructuredTypeDefinition {
    return (
        definition.kind === Kind.Type &&
        (definition as ICsnStructuredTypeDefinition).type === undefined &&
        (definition as ICsnEntityDefinition).elements !== undefined
    );
}

export function isEnumTypeDef(
    definition: ICsnDefinition
): definition is ICsnEnumTypeDefinition {
    return (
        definition.kind === Kind.Type &&
        (definition as ICsnStructuredTypeDefinition).type !== undefined &&
        (definition as ICsnEnumTypeDefinition).enum !== undefined
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
    return (type as ICsnTypeRef)?.ref !== undefined;
}

export function isType(type: Type | string): type is Type {
    const values = Object.keys(Type).map((k) => Type[k as string]);
    return values.includes(type);
}
