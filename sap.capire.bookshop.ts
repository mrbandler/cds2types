import { User, Cuid, Managed, Temporal } from "./cds";
import { CodeList, Countries, Currencies, Languages } from "./sap.common";

export type Addresses = IAddress[];
export type NameStr = string;

export enum Gender {
    NonBinary = 1,
    Male = 2,
    Female = 3,
}

export interface IAddress {
    street: string;
    houseNo: string;
    town: string;
    country: string;
}

export interface IArrayUsingEntity extends ICuid {
    inlineArray: unknown[];
    adressArray: IAddress[];
    compositoinField: IArrayUsingEntity_compositoinField[];
}

export interface IArrayUsingEntity_compositoinField {
    up__ID: string;
    up_?: IArrayUsingEntity;
    idComposition: string;
    quantityComposition: number;
}

export interface IAuthors extends IManaged {
    ID: number;
    name: IName;
    gender: Gender;
    addresses: Addresses[];
    dateOfBirth: Date;
    dateOfDeath: Date;
    placeOfBirth: string;
    placeOfDeath: string;
    books?: IBooks[];
}

export interface IBooks extends IManaged {
    ID: number;
    title: string;
    descr: string;
    author?: IAuthors;
    author_ID?: number;
    genre?: IGenres;
    genre_ID?: number;
    stock: number;
    price: number;
    currency: Currencies;
    currency_code?: string;
}

export interface IGenres extends sap.common.ICodeList {
    ID: number;
    parent?: IGenres;
    parent_ID?: number;
    children: IGenres[];
}

export interface IName {
    firstname: NameStr;
    lastname: NameStr;
}

export enum Entity {
    Address = "sap.capire.bookshop.Address",
    ArrayUsingEntity = "sap.capire.bookshop.ArrayUsingEntity",
    ArrayUsingEntity_compositoinField = "sap.capire.bookshop.ArrayUsingEntity_compositoinField",
    Authors = "sap.capire.bookshop.Authors",
    Books = "sap.capire.bookshop.Books",
    Genres = "sap.capire.bookshop.Genres",
    Name = "sap.capire.bookshop.Name",
}

export enum SanitizedEntity {
    Address = "Address",
    ArrayUsingEntity = "ArrayUsingEntity",
    ArrayUsingEntity_compositoinField = "ArrayUsingEntity_compositoinField",
    Authors = "Authors",
    Books = "Books",
    Genres = "Genres",
    Name = "Name",
}
