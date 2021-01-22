export namespace sap.capire.bookshop {
    export type Addresses = Address[];
    export type NameStr = string;

    export enum Gender {
        NonBinary,
        Male,
        Female,
    }

    export interface Address {
        street: string;
        houseNo: string;
        town: string;
        country: string;
    }

    export interface Authors extends Managed {
        ID: number;
        name: Name;
        gender: Gender;
        addresses: Addresses;
        dateOfBirth: Date;
        dateOfDeath: Date;
        placeOfBirth: string;
        placeOfDeath: string;
        books?: Books[];
    }

    export interface Books extends Managed {
        ID: number;
        title: string;
        descr: string;
        author?: Authors;
        author_ID?: number;
        genre?: Genres;
        genre_ID?: number;
        stock: number;
        price: number;
        currency: sap.common.Currencies;
        currency_code?: string;
    }

    export interface Genres extends sap.common.CodeList {
        ID: number;
        parent?: Genres;
        parent_ID?: number;
        children: Genres[];
    }

    export interface Name {
        firstname: NameStr;
        lastname: NameStr;
    }

    export enum Entity {
        Address = "sap.capire.bookshop.Address",
        Authors = "sap.capire.bookshop.Authors",
        Books = "sap.capire.bookshop.Books",
        Genres = "sap.capire.bookshop.Genres",
        Name = "sap.capire.bookshop.Name",
    }

    export enum SanitizedEntity {
        Address = "Address",
        Authors = "Authors",
        Books = "Books",
        Genres = "Genres",
        Name = "Name",
    }
}

export namespace sap.common {
    export interface CodeList {
        name: string;
        descr: string;
    }

    export interface Countries extends sap.common.CodeList {
        code: string;
    }

    export interface Currencies extends sap.common.CodeList {
        code: string;
        symbol: string;
    }

    export interface Languages extends sap.common.CodeList {
        code: string;
    }

    export enum Entity {
        CodeList = "sap.common.CodeList",
        Countries = "sap.common.Countries",
        Currencies = "sap.common.Currencies",
        Languages = "sap.common.Languages",
    }

    export enum SanitizedEntity {
        CodeList = "CodeList",
        Countries = "Countries",
        Currencies = "Currencies",
        Languages = "Languages",
    }
}

export namespace CatalogService {
    export interface Books {
        createdAt?: Date;
        modifiedAt?: Date;
        ID: number;
        title: string;
        descr: string;
        author: sap.capire.bookshop.Name;
        genre?: Genres;
        genre_ID?: number;
        stock: number;
        price: number;
        currency: Currencies;
        currency_code?: string;
    }

    export namespace Books.actions {
        export enum ActionAddRating {
            name = "addRating",
            paramStars = "stars",
        }

        export interface ActionAddRatingParams {
            stars: number;
        }

        export enum FuncGetViewsCount {
            name = "getViewsCount",
        }

        export type FuncGetViewsCountReturn = number;
    }

    export interface Currencies {
        name: string;
        descr: string;
        code: string;
        symbol: string;
    }

    export interface Genres {
        name: string;
        descr: string;
        ID: number;
        parent?: Genres;
        parent_ID?: number;
        children: Genres[];
    }

    export enum FuncGetBooks {
        name = "getBooks",
        paramAuthor = "author",
    }

    export interface FuncGetBooksParams {
        author: number;
    }

    export type FuncGetBooksReturn = sap.capire.bookshop.Books[];

    export enum ActionSubmitOrder {
        name = "submitOrder",
        paramBook = "book",
        paramAmount = "amount",
    }

    export interface ActionSubmitOrderParams {
        book: number;
        amount: number;
    }

    export enum Entity {
        Books = "CatalogService.Books",
        Currencies = "CatalogService.Currencies",
        Genres = "CatalogService.Genres",
    }

    export enum SanitizedEntity {
        Books = "Books",
        Currencies = "Currencies",
        Genres = "Genres",
    }
}

export type User = string;

export interface Cuid {
    ID: string;
}

export interface Managed {
    createdAt?: Date;
    createdBy?: string;
    modifiedAt?: Date;
    modifiedBy?: string;
}

export interface Temporal {
    validFrom: Date;
    validTo: Date;
}

export enum ActionTest {
    name = "test",
}

export enum Entity {
    Cuid = "cuid",
    Managed = "managed",
    Temporal = "temporal",
}

export enum SanitizedEntity {
    Cuid = "Cuid",
    Managed = "Managed",
    Temporal = "Temporal",
}
