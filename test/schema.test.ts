// This file should be compilable if the types were created correctly.

import { sap } from "../service";

const address: sap.capire.bookshop.IAddress = {
    street: "",
    houseNo: "",
    town: "",
    country: "",
};

const author: sap.capire.bookshop.IAuthors = {
    ID: 1,
    name: {
        firstname: "",
        lastname: "",
    },
    gender: sap.capire.bookshop.Gender.Female,
    addresses: [[address]],
    dateOfBirth: new Date(),
    dateOfDeath: new Date(),
    placeOfBirth: "",
    placeOfDeath: "",
    books: [],
};

const book: sap.capire.bookshop.IBooks = {
    ID: 1,
    title: "",
    descr: "",
    author: author,
    author_ID: 1,
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
};

const arrayUsingEntity: sap.capire.bookshop.IArrayUsingEntity = {
    ID: "",
    inlineArray: [],
    adressArray: [address],
    compositoinField: [
        {
            idComposition: "",
            quantityComposition: 1,
            up__ID: "1",
        },
    ],
};
