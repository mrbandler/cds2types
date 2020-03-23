# cds2types

[![npm version](https://badge.fury.io/js/cds2types.svg)](https://badge.fury.io/js/cds2types) [![pipeline status](https://gitlab.com/mrbandler/cds2types/badges/master/pipeline.svg)](https://gitlab.com/mrbandler/cds2types/commits/master) [![GitHub License](https://img.shields.io/github/license/mrbandler/cds2types)](https://github.com/mrbandler/cds2types/blob/master/LICENSE)

**CLI to convert CDS definitions to native Typescript types.**

## Table of Content

1. [Installation](#1-installation) 💻
2. [Usage](#2-usage) ⌨️
3. [Bugs and Features](#4-bugs-and-features) 🐞💡
4. [License](#5-license) 📃

## 1. Installation

```bash
$ npm install cds2types
```

OR

```bash
$ yarn add cds2types
```

## 2. Usage

Let's look at a CDS example:

```cds
// service.cds

using { managed } from '@sap/cds/common';

service TestService {
    function greet() returns String;
    function foo(bar: String) returns String;
    action bar(foo: String);

    type Gender: String enum { male = 'male'; female = 'female' };
    type EnumTest: String enum { one; two; };

    type UserContext {
        Username: String default 'Embo';
        Email: String;
        Firstname: String;
        Lastname: String;
        Fullname: String;
        Roles: array of String;
        Scopes: array of String;
    }

    entity Foo: managed {
        key FooId: UUID;
        VInlineEnum: Integer enum {
            BarOne = 1;
            BarTwo = 2;
            BarThree = 3;
        };
        FooBool: Boolean;
        FooEnum: Gender;
        FooDate: Date;
        FooTimestamp: Timestamp;
        FooDateTime: DateTime;
        FooString: String;
        FooStringArray: array of String;
        FooDouble: Double;
        FooInteger: Integer;
        virtual FooDecimal: Decimal(10,3);
        Bar: Association to one Bar on Bar.BarString = $self.FooString;
    };

    entity Bar: managed {
        BarString: String;
        Foo: Association to Foo;
    }

    entity Test: managed, Inher {
        Test: String;
    }

    entity Inher {
        InherTest: String;
    }
}
```

Now when we run the CLI:

```bash
$ cds2types --cds ./service.cds --output ./service.ts --prefix I
```

We get the following output:

```typescript
// service.ts

export enum ActionBar {
    name = "bar",
    paramFoo = "foo",
}

export interface IActionBarParams {
    foo: string;
}

export enum FuncFoo {
    name = "foo",
    paramBar = "bar",
}

export interface IFuncFooParams {
    bar: string;
}

export enum FuncGreet {
    name = "greet",
}

export enum EnumTest {
    one,
    two,
}

export enum Gender {
    male = "male",
    female = "female",
}

export interface IBar extends IManaged {
    BarString: string;
    Foo?: IFoo;
    Foo_FooId?: string;
}

export enum FooVInlineEnum {
    BarOne = 1,
    BarTwo = 2,
    BarThree = 3,
}

export interface IFoo extends IManaged {
    FooId: string;
    VInlineEnum: FooVInlineEnum;
    FooBool: boolean;
    FooEnum: unknown;
    FooDate: Date;
    FooTimestamp: Date;
    FooDateTime: Date;
    FooString: string;
    FooStringArray: string[];
    FooDouble: number;
    FooInteger: number;
    FooDecimal?: number;
    Bar?: IBar;
}

export interface IInher {
    InherTest: string;
}

export interface ITest extends IInher, IManaged {
    Test: string;
}

export interface IUserContext {
    Username?: string;
    Email: string;
    Firstname: string;
    Lastname: string;
    Fullname: string;
    Roles: string[];
    Scopes: string[];
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
    Bar = "TestService.Bar",
    Foo = "TestService.Foo",
    Inher = "TestService.Inher",
    Test = "TestService.Test",
    UserContext = "TestService.UserContext",
    Managed = "managed",
    Temporal = "temporal",
}

export enum SanitizedEntity {
    Bar = "Bar",
    Foo = "Foo",
    Inher = "Inher",
    Test = "Test",
    UserContext = "UserContext",
    Managed = "Managed",
    Temporal = "Temporal",
}
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
