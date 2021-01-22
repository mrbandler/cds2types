"use strict";
var __createBinding =
    (this && this.__createBinding) ||
    (Object.create
        ? function (o, m, k, k2) {
              if (k2 === undefined) k2 = k;
              Object.defineProperty(o, k2, {
                  enumerable: true,
                  get: function () {
                      return m[k];
                  },
              });
          }
        : function (o, m, k, k2) {
              if (k2 === undefined) k2 = k;
              o[k2] = m[k];
          });
var __setModuleDefault =
    (this && this.__setModuleDefault) ||
    (Object.create
        ? function (o, v) {
              Object.defineProperty(o, "default", {
                  enumerable: true,
                  value: v,
              });
          }
        : function (o, v) {
              o["default"] = v;
          });
var __importStar =
    (this && this.__importStar) ||
    function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null)
            for (var k in mod)
                if (
                    k !== "default" &&
                    Object.prototype.hasOwnProperty.call(mod, k)
                )
                    __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
    };
Object.defineProperty(exports, "__esModule", { value: true });
exports._cds = void 0;
var cds = __importStar(require("@sap/cds"));
var fs = __importStar(require("fs-extra"));
var function_1 = require("fp-ts/lib/function");
var E = __importStar(require("fp-ts/lib/Either"));
var IOE = __importStar(require("fp-ts/lib/IOEither"));
var TE = __importStar(require("fp-ts/lib/TaskEither"));
var load = function (path) {
    return TE.tryCatch(function () {
        return cds.load(path);
    }, E.toError);
};
var csn2Json = function (csn) {
    return JSON.parse(cds.compile.to.json(csn));
};
var write = function (path) {
    return function (content) {
        return IOE.tryCatch(function () {
            fs.writeFileSync(path, JSON.stringify(content));
            return "Successfully wrote " + path;
        }, E.toError);
    };
};
exports._cds = {
    read: load,
    json: csn2Json,
    write: function (path) {
        return function (json) {
            return function_1.pipe(write(path)(json), TE.fromIOEither);
        };
    },
};
