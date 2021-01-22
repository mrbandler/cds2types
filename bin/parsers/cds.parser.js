"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = void 0;
var Either_1 = require("fp-ts/lib/Either");
var newtype_ts_1 = require("newtype-ts");
var isoDefinitionName = newtype_ts_1.iso();
var extractDefinitions = function (cds) {
    return Object.keys(cds).map(function (k) {
        return {
            name: isoDefinitionName.wrap(k),
            definition: cds[k],
        };
    });
};
var containsNamespace = function (name) {
    return isoDefinitionName.unwrap(name).split(".").length > 0;
};
var namespaceDefinitions = function (defs) {
    return defs.filter(function (def) {
        return containsNamespace(def.name);
    });
};
var globalDefinitions = function (defs) {
    return defs.filter(function (def) {
        return !containsNamespace(def.name);
    });
};
var parse = function (cds) {
    var definitions = extractDefinitions(cds);
    var namespaceDefs = namespaceDefinitions(definitions);
    var globalDefs = globalDefinitions(definitions);
    return Either_1.left("Unable to parse CDS");
};
exports.parse = parse;
