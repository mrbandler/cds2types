"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Types = exports.Actions = exports.Definitions = void 0;
var core_1 = require("./core");
exports.Definitions = {
    isService: function (def) {
        return def.kind === core_1.Kind.Service;
    },
    isEntity: function (def) {
        return def.kind === core_1.Kind.Entity;
    },
    isTypeDef: function (def) {
        return def.kind === core_1.Kind.Type;
    },
    isAction: function (def) {
        return def.kind === core_1.Kind.Action;
    },
    isFunc: function (def) {
        return def.kind === core_1.Kind.Function;
    },
};
exports.Actions = {
    isSingleReturnType: function (type) {
        return type.items === undefined;
    },
    isArrayReturnType: function (type) {
        return type.items !== undefined;
    },
};
exports.Types = {
    isTypeAlias: function (type) {
        return type.type !== undefined && type.enum === undefined;
    },
    isArrayTypeAlias: function (type) {
        return type.type === undefined && type.items !== undefined;
    },
    areTypeItems: function (items) {
        return items.type !== undefined;
    },
    areElementItems: function (items) {
        return items.elements !== undefined;
    },
    isStructuredType: function (type) {
        return type.type === undefined;
    },
    isEnumType: function (type) {
        return type.type !== undefined && type.enum !== undefined;
    },
    isReference: function (type) {
        return type.ref !== undefined;
    },
    isPrimitiveType: function (type) {
        return Object.keys(core_1.PrimitiveType)
            .map(function (k) {
                return core_1.PrimitiveType[k];
            })
            .includes(type);
    },
};
