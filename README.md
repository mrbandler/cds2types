# cds2types

[![npm version](https://badge.fury.io/js/cds2types.svg)](https://badge.fury.io/js/cds2types) [![Actions Status](https://github.com/mrbandler/cds2types/workflows/build/badge.svg)](https://github.com/mrbandler/cds2types/actions) [![GitHub License](https://img.shields.io/github/license/mrbandler/cds2types)](https://github.com/mrbandler/cds2types/blob/master/LICENSE)

**CLI to convert CDS definitions to native Typescript types.**

> ⚠ Breaking change with version 3.0.0 of cds2types:
>
> -   cds2types now uses the CDS version of the project it is used in
> -   You have to pass an output directory to the cds2types command instead of a output file
> -   For each CDS namespace or service a separate file is generated in the output folder (module syntax)

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

using { managed, sap, cuid } from '@sap/cds/common';
namespace sap.capire.bookshop;

entity EntityWithSlashes {
    field1          : String(10);
    ![/part1/part2] : String(23);
}

entity ArrayUsingEntity : cuid {
    inlineArray      : array of {
        id       : String;
        quantity : Integer
    };
    adressArray      : array of Address;
    compositionField : Composition of many {
                           idComposition       : String;
                           quantityComposition : Integer;
                       }
}

entity Books : managed {
    key ID              : Integer;
        title           : localized String(111);
        descr           : localized String(1111);
        longdesc        : localized String(1111111) null;
        author          : Association to Authors;
        genre           : Association to Genres;
        stock           : Integer;
        price           : Decimal(9, 2);
        currency        : Association to one sap.common.Currencies;
        ![/part1/part2] : String(23) default 'test';
}


type Gender    : Integer enum {
    NonBinary = 1;
    Male      = 2;
    Female    = 3;
}

type NameStr   : String(111);

type Name {
    firstname : NameStr;
    lastname  : NameStr;
}

type Address {
    street  : String;
    houseNo : String;
    town    : String;
    country : String;
}

type Addresses : many Address;

entity Authors : managed {
    key ID           : Integer;
        name         : Name;
        gender       : Gender;
        addresses    : Addresses;
        dateOfBirth  : Date;
        dateOfDeath  : Date;
        placeOfBirth : String;
        placeOfDeath : String;
        books        : Association to many Books
                           on books.author = $self;
}

/**
 * Hierarchically organized Code List for Genres
 */
entity Genres : sap.common.CodeList {
    key ID       : Integer;
        parent   : Association to Genres;
        children : Composition of many Genres
                       on children.parent = $self;
}
```

Now when we run the CLI:

```bash
cds2types --cds ./service.cds --output ./ --prefix I
```

We get the following output:

```typescript
// sap.capire.bookshop.ts

import { ICurrencies, Locale } from "./sap.common";

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

export interface IArrayUsingEntity {
    ID: string;
    inlineArray: unknown[];
    adressArray: IAddress[];
    compositionField: ICompositionField[];
}

export interface ICompositionField {
    up_?: IArrayUsingEntity;
    up__ID?: string;
    idComposition: string;
    quantityComposition: number;
}

export interface IAuthors {
    createdAt?: Date;
    createdBy?: string;
    modifiedAt?: Date;
    modifiedBy?: string;
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

export interface IBooks {
    createdAt?: Date;
    createdBy?: string;
    modifiedAt?: Date;
    modifiedBy?: string;
    ID: number;
    title: string;
    descr: string;
    longdesc: string | null;
    author?: IAuthors;
    author_ID?: number;
    genre?: IGenres;
    genre_ID?: number;
    stock: number;
    price: number;
    currency?: ICurrencies;
    currency_code?: string;
    "/part1/part2"?: string;
    texts?: IBooksTexts[];
    localized?: IBooksTexts;
}

export interface IBooksTexts {
    locale: Locale;
    ID: number;
    title: string;
    descr: string;
    longdesc: string;
}

export interface IEntityWithSlashes {
    field1: string;
    "/part1/part2": string;
}

export interface IGenres {
    name: string;
    descr: string;
    ID: number;
    parent?: IGenres;
    parent_ID?: number;
    children: IGenres[];
    texts?: IGenresTexts[];
    localized?: IGenresTexts;
}

export interface IGenresTexts {
    locale: Locale;
    name: string;
    descr: string;
    ID: number;
}

export interface IName {
    firstname: NameStr;
    lastname: NameStr;
}

export enum Entity {
    Address = "sap.capire.bookshop.Address",
    ArrayUsingEntity = "sap.capire.bookshop.ArrayUsingEntity",
    CompositionField = "sap.capire.bookshop.ArrayUsingEntity.compositionField",
    Authors = "sap.capire.bookshop.Authors",
    Books = "sap.capire.bookshop.Books",
    BooksTexts = "sap.capire.bookshop.Books.texts",
    EntityWithSlashes = "sap.capire.bookshop.EntityWithSlashes",
    Genres = "sap.capire.bookshop.Genres",
    GenresTexts = "sap.capire.bookshop.Genres.texts",
    Name = "sap.capire.bookshop.Name",
}

export enum SanitizedEntity {
    Address = "Address",
    ArrayUsingEntity = "ArrayUsingEntity",
    CompositionField = "CompositionField",
    Authors = "Authors",
    Books = "Books",
    BooksTexts = "BooksTexts",
    EntityWithSlashes = "EntityWithSlashes",
    Genres = "Genres",
    GenresTexts = "GenresTexts",
    Name = "Name",
}
```

```typescript
// sap.common.ts

export type Locale = string;

export interface ICountries {
    name: string;
    descr: string;
    code: string;
    texts?: ICountriesTexts[];
    localized?: ICountriesTexts;
}

export interface ICountriesTexts {
    locale: Locale;
    name: string;
    descr: string;
    code: string;
}

export interface ICurrencies {
    name: string;
    descr: string;
    code: string;
    symbol: string;
    texts?: ICurrenciesTexts[];
    localized?: ICurrenciesTexts;
}

export interface ICurrenciesTexts {
    locale: Locale;
    name: string;
    descr: string;
    code: string;
}

export interface ILanguages {
    name: string;
    descr: string;
    code: Locale;
    texts?: ILanguagesTexts[];
    localized?: ILanguagesTexts;
}

export interface ILanguagesTexts {
    locale: Locale;
    name: string;
    descr: string;
    code: Locale;
}

export enum Entity {
    Countries = "sap.common.Countries",
    CountriesTexts = "sap.common.Countries.texts",
    Currencies = "sap.common.Currencies",
    CurrenciesTexts = "sap.common.Currencies.texts",
    Languages = "sap.common.Languages",
    LanguagesTexts = "sap.common.Languages.texts",
}

export enum SanitizedEntity {
    Countries = "Countries",
    CountriesTexts = "CountriesTexts",
    Currencies = "Currencies",
    CurrenciesTexts = "CurrenciesTexts",
    Languages = "Languages",
    LanguagesTexts = "LanguagesTexts",
}
```

```typescript
// other.ts

export type User = string;

export enum Entity {}

export enum SanitizedEntity {}
```

## 3. Bugs and Features

Please open a issue when you encounter any bugs 🐞 or if you have an idea for a additional feature 💡.

---

## 4. License

MIT License

Copyright (c) 2019 mrbandler

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
