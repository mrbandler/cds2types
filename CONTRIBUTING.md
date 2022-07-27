# Contributing

## Table of Content

1. [Style Guide](#1-style-guide)
2. [Program Flow](#2-program-flow)
3. [User Input](#3-user-input)
4. [Compiling CDS](#4-compiling-cds)
5. [Parsing CDS](#5-parsing-cds)
6. [Code Generation](#6-code-generation)
7. [Output](#7-output)

## 1. Style Guide

### 1.1 Brackets & Quotes

#### Brackets

**DO**

```typescript
export class Example {
    constructor Example() {

    }
}
```

**DON'T**

```typescript
export class Example
{
    constructor Example()
    {

    }
}
```

#### Quotes

**DO**

```typescript
import { example } from "./example";

let str = "Hello, World!";
```

**DON'T**

```typescript
import { example } from "./example";

let str = "Hello, World!";
```

### 1.2 Exports

Please **DO NOT** export default fields, this makes refactoring harder in the long run.

**DO**

```typescript
// export.ts
export class Example {}

// import.ts
import { Example } from "./export";
```

**DON'T**

```typescript
// export.ts
export default class Example {}

// import.ts
import Example from "./export";
```

### 1.3 Interfaces

Interfaces should always be prefixed with **I**.

**DO**

```typescript
export interface IExample {}
```

**DON'T**

```typescript
export interface Example {}
```

### 1.4 Comments and JSDoc

TODO

## 2. Program Flow

```
 +------------------+
 | User Input (CLI) |
 +--------+---------+
          |
          v
+---------+----------+
| Compile CDS Source |
+---------+----------+
          |
          v
 +--------+---------+
 | Parse CDS Output |
 +--------+---------+
          |
          v
 +--------+---------+
 | Code Generation  |
 +--------+---------+
          |
          v
  +-------+--------+
  | Save TS Source |
  +----------------+
```

## 3. User Input

**cds2types** is a CLI, all user input will be given in form of flags and values from the command line.

[`Commander`](https://github.com/tj/commander.js/) is used to parse the CLI input and give them to the execution process via a options object.

**Option object:**

```typescript
export interface IOptions {
    cds: string; // CDS input path
    output: string; // Typescript output path
    prefix: string; // Interface prefix
    json: boolean; // Flag, whether or not to print the compiled CDS JSON
    version: string; // Version number of the CLI
}
```

## 4. Compiling CDS

TODO

## 5. Parsing CDS

The compiled CDS JSON output will not be parsed in its entirety. Instead of directly translating the JSON object to a typed representation in Typescript it will be looped upon to extract only information valueable for code generation.

The type and interface definitions of the **cds2types** representation can be found in the [`./src/utils/cds.ts`](https://github.com/kiko240/cds2types/blob/master/src/utils/cds.ts) file.

The parsing logic can be found in the [`./src/cds.parser.ts`](https://github.com/kiko240/cds2types/blob/master/src/cds.parser.ts)

> **NOTE:** Changes in the CDS compiler will most likely create changes in the parsing process of **cds2types**. Because of time related issues I never came around to fully type the CDS JSON output, but it would be a much safer way to work with it and catch bugs early.

### 5.1 Parsing Definitions

There are four types of definitions **cds2types** can work with:

-   Service
-   Entity
-   Type
-   Function/Action

There are also exceptions to the rule, for instance localized that is not a concern to the **cds2types** parser, as it's not adding any value for the typed output.

Exceptions:

-   Entity elements with a target to a entity/type named `*_texts`
-   Entities/Types named `*_texts`
-   Entities/Types named `localized.*`

### 5.2 Services & Namespaces

Services will be parsed directly from definitions inside of the compiled CDS JSON output, as these are represented as definitions themselves.

Every subsequent entity/type found with the service name prepended (i.e. `ServiceName.EntityName`) will extract the last entry from a split with the `.` delimiter and lookup the previously created namespaced and add the definition there.

For namespaces the procedure is a bit different. A namespace is not represented as a direct definitions inside of the compiled CDS JSON output. But entity/type definitions inside a namespace will have the name prepended (i.e. `name.space.Entity`).

Once we encounter a entity/type we check if the prepended namespace (`name.space`) is already represented if not it will be created and the entity/type (`Entity`) is added, otherwise the entity/type (`Entity`) will just be added to the found namespace for the given name of the namespace.

### 5.3 CDS JSON vs. cds2types typed

The next sections provide a overview for CDS JSON vs. **cds2types** typed representation.

#### 5.3.1 Service

```json
"CatalogService": {
    "@source": "service.cds",
    "kind": "service",
    "@path": "/browse"
}
```

```typescript
const service: IService = {
    name: "CatalogService",
    definitions: new Map<string, IDefinition>(),
};
```

#### 5.3.2 Entity

```json
"CatalogService.Books": {
    "kind": "entity",
    "@readonly": true,
    "query": {
        "SELECT": {
            "from": { "ref": ["sap.capire.bookshop.Books"] },
            "columns": [
                "*",
                { "ref": ["author", "name"], "as": "author" }
            ],
            "excluding": ["createdBy", "modifiedBy"]
        }
    },
    "elements": {
        "createdAt": {
            "@Core.Immutable": true,
            "@UI.HiddenFilter": true,
            "@cds.on.insert": { "=": "$now" },
            "@odata.on.insert": { "#": "now" },
            "@readonly": true,
            "@title": "{i18n>CreatedAt}",
            "type": "cds.Timestamp"
        },
        "modifiedAt": {
            "@UI.HiddenFilter": true,
            "@cds.on.insert": { "=": "$now" },
            "@cds.on.update": { "=": "$now" },
            "@odata.on.update": { "#": "now" },
            "@readonly": true,
            "@title": "{i18n>ChangedAt}",
            "type": "cds.Timestamp"
        },
        "ID": { "key": true, "type": "cds.Integer" },
        "title": {
            "localized": true,
            "type": "cds.String",
            "length": 111
        },
        "descr": {
            "localized": true,
            "type": "cds.String",
            "length": 1111
        },
        "author": { "type": "cds.String", "length": 111 },
        "genre": {
            "type": "cds.Association",
            "target": "CatalogService.Genres",
            "keys": [{ "ref": ["ID"] }]
        },
        "stock": { "type": "cds.Integer" },
        "price": { "type": "cds.Decimal", "precision": 9, "scale": 2 },
        "currency": {
            "@description": "{i18n>CurrencyCode.Description}",
            "@title": "{i18n>Currency}",
            "type": "Currency",
            "target": "CatalogService.Currencies",
            "keys": [{ "ref": ["code"] }]
        },
        "texts": {
            "type": "cds.Composition",
            "cardinality": { "max": "*" },
            "target": "CatalogService.Books_texts",
            "on": [{ "ref": ["texts", "ID"] }, "=", { "ref": ["ID"] }]
        },
        "localized": {
            "type": "cds.Association",
            "target": "CatalogService.Books_texts",
            "on": [
                { "ref": ["localized", "ID"] },
                "=",
                { "ref": ["ID"] },
                "and",
                { "ref": ["localized", "locale"] },
                "=",
                { "ref": ["$user", "locale"] }
            ]
        }
    },
    "$syntax": "entity"
}
```

```typescript
const entity: IDefinition = {
    kind: "entity",
    elements: new Map<
        string,
        IElement
    >([
        ["createdAt": {
            type: "cds.Timestamp",
            isArray: false,
            canBeNull: true,
            cardinality: { max: CDSCardinality.one },
        }],
        ["modifiedAt": {
            type: "cds.Timestamp",
            isArray: false,
            canBeNull: true,
            cardinality: { max: CDSCardinality.one },
        }],
        ["ID": {
            type: "cds.Integer",
            isArray: false,
            canBeNull: false,
            cardinality: { max: CDSCardinality.one },
        }],
        ["title": {
            type: "cds.String",
            isArray: false,
            canBeNull: false,
            cardinality: { max: CDSCardinality.one },
        }],
        ["descr": {
            type: "cds.String",
            isArray: false,
            canBeNull: false,
            cardinality: { max: CDSCardinality.one },
        }],
        ["author": {
            type: "cds.String",
            isArray: false,
            canBeNull: false,
            cardinality: { max: CDSCardinality.one },
        }],
        ["genre": {
            type: "cds.Association",
            isArray: false,
            canBeNull: false,
            cardinality: { max: CDSCardinality.one },
            target: "CatalogService.Genres",
            keys: [{ "ref": ["ID"] }]
        }],
        ["stock": {
            type: "cds.Integer",
            isArray: false,
            canBeNull: false,
            cardinality: { max: CDSCardinality.one },
        }],
        ["price": {
            type: "cds.Decimal",
            isArray: false,
            canBeNull: false,
            cardinality: { max: CDSCardinality.one },
        }],
        ["currency": {
            type: "Currency",
            isArray: false,
            canBeNull: false,
            cardinality: { max: CDSCardinality.one },
            target: "CatalogService.Currencies",
            keys: [{ "ref": ["code"] }]
        }],
    ])
};
```

#### 5.3.3 Type

```json
"Currency": {
    "kind": "type",
    "@description": "{i18n>CurrencyCode.Description}",
    "@title": "{i18n>Currency}",
    "type": "cds.Association",
    "target": "sap.common.Currencies",
    "keys": [{ "ref": ["code"] }]
}
```

```typescript
const type: IDefinition = {
    kind: "type",
    type: "cds.Association",
    target: "sap.common.Currencies",
    keys: [{ ref: ["code"] }],
};
```

#### 5.3.4 Function/Action

```json
"CatalogService.submitOrder": {
    "kind": "action",
    "@requires_": "authenticated-user",
    "params": {
        "book": { "type": { "ref": ["CatalogService.Books", "ID"] } },
        "amount": { "type": "cds.Integer" }
    }
}
```

```typescript
const actionFunc: IDefinition = {
    kind: "action",
    params: new Map<string, IParamType>([
        ["book": {
            type: { "ref": ["CatalogService.Books", "ID"] },
        }],
        ["amount": {
            type: "cds.Integer",
        }],
    ])
}
```

## 6. Code Generation

## 7. Output
