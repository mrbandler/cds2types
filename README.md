# cds2types

[![npm version](https://badge.fury.io/js/cds2types.svg)](https://badge.fury.io/js/cds2types) [![Actions Status](https://github.com/kiko240/cds2types/workflows/build/badge.svg)](https://github.com/kiko240/cds2types/actions) [![GitHub License](https://img.shields.io/github/license/kiko240/cds2types)](https://github.com/kiko240/cds2types/blob/master/LICENSE)

**CLI to convert CDS definitions to native Typescript types.**

## Table of Content

1. [Installation](#1-installation) 💻
2. [Usage](#2-usage) ⌨️
3. [Bugs and Features](#3-bugs-and-features) 🐞💡
4. [License](#4-license) 📃

## 1. Installation

```bash
npm install cds2types --save-dev
```

OR

```bash
yarn add cds2types --dev
```

## 2. Usage

Let's look at a CDS example:

```cds
// schema.cds

using { Currency, managed, sap } from '@sap/cds/common';
namespace sap.capire.bookshop;

entity Books : managed {
    key ID   : Integer;
    title    : localized String(111);
    descr    : localized String(1111);
    author   : Association to Authors;
    genre    : Association to Genres;
    stock    : Integer;
    price    : Decimal(9,2);
    currency : Currency;
}

type Gender : Integer enum {
    NonBinary;
    Male;
    Female;
}

type NameStr : String(111);

type Name {
    firstname: NameStr;
    lastname: NameStr;
}

type Address {
    street: String;
    houseNo: String;
    town: String;
    country: String;
}

type Addresses : many Address;

entity Authors : managed {
    key ID       : Integer;
    name         : Name;
    gender       : Gender;
    addresses    : Addresses;
    dateOfBirth  : Date;
    dateOfDeath  : Date;
    placeOfBirth : String;
    placeOfDeath : String;
    books        : Association to many Books on books.author = $self;
}

/** Hierarchically organized Code List for Genres */
entity Genres : sap.common.CodeList {
    key ID   : Integer;
    parent   : Association to Genres;
    children : Composition of many Genres on children.parent = $self;
}
```

Now when we run the CLI:

```bash
cds2types --cds ./service.cds --output ./service.ts --prefix I
```

We get the following output:

```typescript
// service.ts

export namespace sap.capire.bookshop {
    export type Addresses = IAddress[];
    export type NameStr = string;

    export enum Gender {
        NonBinary,
        Male,
        Female,
    }

    export interface IAddress {
        street: string;
        houseNo: string;
        town: string;
        country: string;
    }

    export interface IAuthors extends IManaged {
        ID: number;
        name: IName;
        gender: Gender;
        addresses: Addresses;
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
        currency: sap.common.ICurrencies;
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
    export interface ICodeList {
        name: string;
        descr: string;
    }

    export interface ICountries extends sap.common.ICodeList {
        code: string;
    }

    export interface ICurrencies extends sap.common.ICodeList {
        code: string;
        symbol: string;
    }

    export interface ILanguages extends sap.common.ICodeList {
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

export interface ICuid {
    ID: string;
}

export interface IManaged {
    createdAt?: Date;
    createdBy?: string;
    modifiedAt?: Date;
    modifiedBy?: string;
}

export interface ITemporal {
    validFrom: Date;
    validTo: Date;
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
```

## 3. Bugs and Features

Please open a issue when you encounter any bugs 🐞 or if you have an idea for a additional feature 💡.

---

## 4. License

MIT License

Copyright (c) 2022 kiko240

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
