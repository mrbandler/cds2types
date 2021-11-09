import { User, Cuid, Managed, Temporal } from "./cds";
import { CodeList, Countries, Currencies, Languages } from "./sap.common";

export interface IActionReturnType {
    success: boolean;
}

export interface IArrayUsingEntity {
    ID: string;
    inlineArray: unknown[];
    adressArray: sap.capire.bookshop.IAddress[];
    compositoinField: IArrayUsingEntity_compositoinField[];
}

export interface IArrayUsingEntity_compositoinField {
    up__ID: string;
    up_?: IArrayUsingEntity;
    idComposition: string;
    quantityComposition: number;
}

export interface IAuthors {
    createdAt?: Date;
    createdBy?: string;
    modifiedAt?: Date;
    modifiedBy?: string;
    ID: number;
    name: sap.capire.bookshop.IName;
    gender: sap.capire.bookshop.Gender;
    addresses: sap.capire.bookshop.Addresses[];
    dateOfBirth: Date;
    dateOfDeath: Date;
    placeOfBirth: string;
    placeOfDeath: string;
    books?: IBooks[];
}

export interface IBooks {
    createdAt?: Date;
    modifiedAt?: Date;
    ID: number;
    title: string;
    descr: string;
    author: sap.capire.bookshop.IName;
    genre?: IGenres;
    genre_ID?: number;
    stock: number;
    price: number;
    currency: ICurrencies;
    currency_code?: string;
}

export namespace IBooks.actions {
    export enum ActionAddRating {
        name = "addRating",
        paramStars = "stars",
    }

    export interface IActionAddRatingParams {
        stars: number;
    }

    export enum FuncGetViewsCount {
        name = "getViewsCount",
    }

    export type FuncGetViewsCountReturn = number;
}

export interface ICurrencies {
    name: string;
    descr: string;
    code: string;
    symbol: string;
}

export interface IGenres {
    name: string;
    descr: string;
    ID: number;
    parent?: IGenres;
    parent_ID?: number;
    children: IGenres[];
}

export interface IServiceEntity {
    id: string;
    arrayComplex: IArrayParameterType[];
    arraySimple: string[];
}

export interface IArrayParameterType {
    value: string;
}

export interface ITypedParameterType {
    value: string;
}

export enum FuncGetBooks {
    name = "getBooks",
    paramAuthor = "author",
}

export interface IFuncGetBooksParams {
    author: number;
}

export type FuncGetBooksReturn = sap.capire.bookshop.IBooks[];

export enum ActionSubmitOrder {
    name = "submitOrder",
    paramBook = "book",
    paramAmount = "amount",
}

export interface IActionSubmitOrderParams {
    book: number;
    amount: number;
}

export enum ActionUnboudAction {
    name = "unboudAction",
    paramSimpleParameter = "simpleParameter",
    paramArrayParameter = "arrayParameter",
    paramTypedParameter = "typedParameter",
}

export interface IActionUnboudActionParams {
    simpleParameter: string;
    arrayParameter: IArrayParameterType[];
    typedParameter: ITypedParameterType;
}

export type ActionUnboudActionReturn = IActionReturnType;

export enum Entity {
    ActionReturnType = "CatalogService.ActionReturnType",
    ArrayUsingEntity = "CatalogService.ArrayUsingEntity",
    ArrayUsingEntity_compositoinField = "CatalogService.ArrayUsingEntity_compositoinField",
    Authors = "CatalogService.Authors",
    Books = "CatalogService.Books",
    Currencies = "CatalogService.Currencies",
    Genres = "CatalogService.Genres",
    ServiceEntity = "CatalogService.ServiceEntity",
    ArrayParameterType = "CatalogService.arrayParameterType",
    TypedParameterType = "CatalogService.typedParameterType",
}

export enum SanitizedEntity {
    ActionReturnType = "ActionReturnType",
    ArrayUsingEntity = "ArrayUsingEntity",
    ArrayUsingEntity_compositoinField = "ArrayUsingEntity_compositoinField",
    Authors = "Authors",
    Books = "Books",
    Currencies = "Currencies",
    Genres = "Genres",
    ServiceEntity = "ServiceEntity",
    ArrayParameterType = "ArrayParameterType",
    TypedParameterType = "TypedParameterType",
}
