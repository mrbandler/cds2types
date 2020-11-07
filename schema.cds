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
