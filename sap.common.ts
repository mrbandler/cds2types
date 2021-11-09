import { User, Cuid, Managed, Temporal } from "./cds";

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
