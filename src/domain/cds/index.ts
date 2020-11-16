import { ArrayReturnType, Kind, PrimitiveType, Reference, ReturnType, SingleReturnType, Type } from "./core";
import { Service } from "./service";
import { Entity } from "./entity";
import { ArrayTypeAlias, ElementItems, EnumType, Items, StructuredType, TypeAlias, TypeDef, TypeItems } from "./type";
import { Action } from "./action";
import { Func } from "./func";

/**
 * CDS definition.
 */
export type Definition = Service | Entity | TypeDef | Action | Func;

/**
 * CDS definitions.
 *
 * @export
 * @interface Definitions
 */
export interface Definitions {
    readonly [name: string]: Definition;
}

/**
 * CDS.
 *
 * @export
 * @interface CDS
 */
export interface CDS {
    readonly definitions: Definitions;
}

/**
 * Namespace for definition predicates.
 */
export const Definitions = {
    /**
     * isService :: Definition -> Boolean
     *
     * @param {Definition} def Definition to check
     * @returns {def is Service} Flag, whether or not the definition is a service
     */
    isService: (def: Definition): def is Service => def.kind === Kind.Service,

    /**
     * isEntity :: Definition -> Boolean
     *
     * @param {Definition} def Definition to check
     * @returns {def is Entity} Flag, whether or not the definition is a entity
     */
    isEntity: (def: Definition): def is Entity => def.kind === Kind.Entity,

    /**
     * isTypeDef :: Definition -> Boolean
     *
     * @param {Definition} def Definition to check
     * @returns {def is TypeDef} Flag, whether or not the definition is a type
     */
    isTypeDef: (def: Definition): def is TypeDef => def.kind === Kind.Type,

    /**
     * isAction :: Definition -> Boolean
     *
     * @param {Definition} def Definition to check
     * @returns {def is Action} Flag, whether or not the definition is a action
     */
    isAction: (def: Definition): def is Action => def.kind === Kind.Action,

    /**
     * isFunc :: Definition -> Boolean
     *
     * @param {Definition} def Definition to check
     * @returns {def is Func} Flag, whether or not the definition is a function
     */
    isFunc: (def: Definition): def is Func => def.kind === Kind.Function,
};

export const Actions = {
    /**
     * isSingleReturnType :: ReturnType -> Boolean
     *
     * @param {ReturnType} type Return type to check
     * @returns {type is SingleReturnType} Flag, whether or not the type is a single return type
     */
    isSingleReturnType: (type: ReturnType): type is SingleReturnType => (type as ArrayReturnType).items === undefined,

    /**
     * isArrayReturnType :: ReturnType -> Boolean
     *
     * @param {ReturnType} type Return type to check
     * @returns {type is ArrayReturnType} Flag, whether or not the type is a arrary return type
     */
    isArrayReturnType: (type: ReturnType): type is ArrayReturnType => (type as ArrayReturnType).items !== undefined,
};

export const Types = {
    /**
     * isTypeAlias :: TypeDef -> Boolean
     *
     * @param {TypeDef} type Type to check
     * @returns {type is TypeAlias} Flag, whether or not the type is a type alias
     */
    isTypeAlias: (type: TypeDef): type is TypeAlias =>
        (type as StructuredType).type !== undefined && (type as EnumType).enum === undefined,

    /**
     * isArrayTypeAlias :: TypeDef -> Boolean
     *
     * @param {TypeDef} type Type to check
     * @returns {type is ArrayTypeAlias} Flag, whether or not the type is a array type alias
     */
    isArrayTypeAlias: (type: TypeDef): type is ArrayTypeAlias =>
        (type as StructuredType).type === undefined && (type as ArrayTypeAlias).items !== undefined,

    /**
     * areTypeItems :: Items -> Boolean
     *
     * @param {Items} items Items to check
     * @returns {items is TypeItems} Flag, whether or not the items are type items
     */
    areTypeItems: (items: Items): items is TypeItems => (items as TypeItems).type !== undefined,

    /**
     * areElementItems :: Items -> Boolean
     *
     * @param {Items} items Items to check
     * @returns {items is ElementItems} Flag, whether or not the items are element items
     */
    areElementItems: (items: Items): items is ElementItems => (items as ElementItems).elements !== undefined,

    /**
     * isStructuredType :: TypeDef -> Boolean
     *
     * @param {TypeDef} type Type to check
     * @returns {type is StructuredType} Flag, whether or not the type is a structured type
     */
    isStructuredType: (type: TypeDef): type is StructuredType => (type as StructuredType).type === undefined,

    /**
     * isEnumType :: TypeDef -> Boolean
     *
     * @param {TypeDef} type Type to check
     * @returns {type is EnumType} Flag, whether or not the type is a enum type
     */
    isEnumType: (type: TypeDef): type is EnumType =>
        (type as StructuredType).type !== undefined && (type as EnumType).enum !== undefined,

    /**
     * isReference :: Type -> Boolean
     *
     * @param {Type} type Type to check
     * @returns {type is Reference} Flag, whether or not the type is a reference
     */
    isReference: (type: Type): type is Reference => (type as Reference).ref !== undefined,

    /**
     * isPrimitiveType :: Type -> Boolean
     *
     * @param {Type} type Type to check
     * @returns {type is PrimitiveType} Flag, whether or not the type is a primitive type
     */
    isPrimitiveType: (type: Type): type is PrimitiveType =>
        Object.keys(PrimitiveType)
            .map(k => PrimitiveType[k as string])
            .includes(type),
};
