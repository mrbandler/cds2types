// This file should be compilable if the types were created correctly.

import { Gender, IAddress, IArrayUsingEntity, IAuthors, IBooks } from "./gen/sap.capire.bookshop";


const address: IAddress = {
    street: "",
    houseNo: "",
    town: "",
    country: "",
};

const author: IAuthors = {
    ID: 1,
    name: {
        firstname: "",
        lastname: "",
    },
    gender: Gender.Female,
    addresses: [address],
    dateOfBirth: new Date(),
    dateOfDeath: new Date(),
    placeOfBirth: "",
    placeOfDeath: "",
    books: [],
};

const book: IBooks = {
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
            descr: ""
        },
        name: "",
        descr: "",
        children: []
    },
    genre_ID: 1,
    stock: 1,
    price: 1,
    currency: {
        code: "",
        descr: "",
        name: "",
        symbol: "",
        minorUnit: "",
    },
    currency_code: "",
    longdesc: ""
};

const arrayUsingEntity: IArrayUsingEntity = {
    ID: "",
    inlineArray: [],
    adressArray: [address],
    compositionField: [
        {
            idComposition: "",
            quantityComposition: 1,
            up__ID: "1",
        },
    ],
};
