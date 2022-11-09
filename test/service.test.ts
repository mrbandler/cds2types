// This file should be compilable if the types were created correctly.

import { CatalogService } from "./service";

const serviceEntity: CatalogService.IServiceEntity = {
    id: "",
    arrayComplex: [
        {
            value: "",
        },
    ],
    arraySimple: [""],
};

const arrayUsingEntity: CatalogService.IArrayUsingEntity = {
    ID: "",
    inlineArray: [],
    adressArray: [
        {
            street: "",
            houseNo: "",
            town: "",
            country: "",
        },
    ],
    compositoinField: [
        {
            idComposition: "",
            quantityComposition: 1,
            up__ID: "",
        },
    ],
};

const book: CatalogService.IBooks = {
    ID: 1,
    title: "",
    descr: "",
    author: {
        firstname: "",
        lastname: "",
    },
    genre: {
        ID: 1,
        parent: {
            ID: 2,
            children: [],
            name: "",
            descr: "",
        },
        name: "",
        descr: "",
        children: [],
    },
    genre_ID: 1,
    stock: 1,
    price: 1,
    currency: {
        code: "",
        descr: "",
        name: "",
        symbol: "",
    },
    currency_code: "",
    longdesc: ""
};

const authorAddRatingAction: CatalogService.IBooks.actions.IActionAddRatingParams = {
    stars: 1,
};

const authorGetViewsCountFunction: CatalogService.IBooks.actions.FuncGetViewsCountReturn = 1;

const getBooksFunctionParams: CatalogService.IFuncGetBooksParams = {
    author: 1,
};

const unboundActionParams: CatalogService.IActionUnboudActionParams = {
    simpleParameter: "",
    arrayParameter: [
        {
            value: "",
        },
    ],
    typedParameter: {
        value: "",
    },
};
const unboundActionReturn: CatalogService.ActionUnboudActionReturn = {
    success: true,
};

const actionSubmitOrderParams: CatalogService.IActionSubmitOrderParams = {
    book: 1,
    amount: 1,
};
