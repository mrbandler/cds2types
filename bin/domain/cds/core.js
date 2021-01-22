"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cardinality = exports.Kind = exports.PrimitiveType = exports.Managed = void 0;
var Managed;
(function (Managed) {
    Managed["CreatedAt"] = "createdAt";
    Managed["CreatedBy"] = "createdBy";
    Managed["ModifiedAt"] = "modifiedAt";
    Managed["ModifiedBy"] = "modifiedBy";
})((Managed = exports.Managed || (exports.Managed = {})));
var PrimitiveType;
(function (PrimitiveType) {
    PrimitiveType["Association"] = "cds.Association";
    PrimitiveType["Composition"] = "cds.Composition";
    PrimitiveType["Uuid"] = "cds.UUID";
    PrimitiveType["Boolean"] = "cds.Boolean";
    PrimitiveType["Integer"] = "cds.Integer";
    PrimitiveType["Integer64"] = "cds.Integer64";
    PrimitiveType["Decimal"] = "cds.Decimal";
    PrimitiveType["DecimalFloat"] = "cds.DecimalFloat";
    PrimitiveType["Double"] = "cds.Double";
    PrimitiveType["Date"] = "cds.Date";
    PrimitiveType["Time"] = "cds.Time";
    PrimitiveType["DateTime"] = "cds.DateTime";
    PrimitiveType["Timestamp"] = "cds.Timestamp";
    PrimitiveType["String"] = "cds.String";
    PrimitiveType["Binary"] = "cds.Binary";
    PrimitiveType["LargeString"] = "cds.LargeString";
    PrimitiveType["LargeBinary"] = "cds.LargeBinary";
})((PrimitiveType = exports.PrimitiveType || (exports.PrimitiveType = {})));
var Kind;
(function (Kind) {
    Kind["Service"] = "service";
    Kind["Entity"] = "entity";
    Kind["Type"] = "type";
    Kind["Function"] = "function";
    Kind["Action"] = "action";
    Kind["Association"] = "cds.Association";
})((Kind = exports.Kind || (exports.Kind = {})));
var Cardinality;
(function (Cardinality) {
    Cardinality["many"] = "*";
    Cardinality[(Cardinality["one"] = 1)] = "one";
})((Cardinality = exports.Cardinality || (exports.Cardinality = {})));
