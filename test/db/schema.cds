using {
    Currency,
    managed,
    sap,
    cuid
} from '@sap/cds/common';

namespace sap.capire.bookshop;

entity EntityWithSlashes {
    field1          : String(10);
    ![/part1/part2] : String(23);
}

entity ArrayUsingEntity : cuid {
    inlineArray      : array of {
        id           : String;
        quantity     : Integer
    };
    adressArray      : array of Address;
    compositoinField : Composition of many {
                           idComposition       : String;
                           quantityComposition : Integer;
                       }
}

entity Books : managed {
    key ID              : Integer;
        title           : localized String(111);
        descr           : localized String(1111);
        longdesc        : localized String(1111111);
        author          : Association to Authors;
        genre           : Association to Genres;
        stock           : Integer;
        price           : Decimal(9, 2);
        currency        : Currency;
        ![/part1/part2] : String(23) default 'test';
}


type Gender : Integer enum {
    NonBinary = 1;
    Male      = 2;
    Female    = 3;
}

type NameStr : String(111);

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
