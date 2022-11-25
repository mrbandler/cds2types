// This file should be compilable if the types were created correctly.

import {
    ActionUnboudActionReturn,
    FuncGetViewsCountReturn,
    IActionAddRatingParams,
    IActionSubmitOrderParams,
    IActionUnboudActionParams,
    IArrayUsingEntity,
    IBooks,
    IFuncGetBooksParams,
    IServiceEntity,
} from "./gen/CatalogService";

const serviceEntity: IServiceEntity = {
    id: "",
    arrayComplex: [
        {
            value: "",
        },
    ],
    arraySimple: [""],
};

const arrayUsingEntity: IArrayUsingEntity = {
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
    compositionField: [
        {
            idComposition: "",
            quantityComposition: 1,
            up__ID: "",
        },
    ],
};

const book: IBooks = {
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
    longdesc: "",
};

const authorAddRatingAction: IActionAddRatingParams = {
    stars: 1,
};

const authorGetViewsCountFunction: FuncGetViewsCountReturn = 1;

const getBooksFunctionParams: IFuncGetBooksParams = {
    author: 1,
};

const unboundActionParams: IActionUnboudActionParams = {
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
const unboundActionReturn: ActionUnboudActionReturn = {
    success: true,
};

const actionSubmitOrderParams: IActionSubmitOrderParams = {
    book: 1,
    amount: 1,
};
