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
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, "__esModule", { value: true });
exports.cli = void 0;
var commander_1 = __importDefault(require("commander"));
var E = __importStar(require("fp-ts/lib/Either"));
var TE = __importStar(require("fp-ts/lib/TaskEither"));
var function_1 = require("fp-ts/lib/function");
var Console_1 = require("fp-ts/lib/Console");
var cds_1 = require("./cds");
var write = function (msg) {
    return function_1.pipe(msg, Console_1.log);
};
var exit = function (error) {
    return function () {
        return console.error(error.message, 1);
    };
};
var parse = function (args) {
    var cmd = new commander_1.default.Command()
        .version("2.5.1")
        .description(
            "CLI to convert CDS models to Typescript interfaces and enumerations"
        )
        .option("-c, --cds <file.cds>", "CDS file to convert")
        .option(
            "-o, --output <file.ts>",
            "Output location for the *.ts file(s)"
        )
        .option("-p, --prefix <I>", "Interface prefix", "")
        .option(
            "-j, --json",
            "Prints the compiled JSON representation of the CDS sources"
        )
        .parse(
            args.map(function (a) {
                return a;
            })
        );
    var help = cmd.helpInformation();
    return !args.slice(2).length
        ? E.left(new Error(help))
        : E.right(cmd.opts());
};
var run = function (cds) {
    return function (args) {
        var cds2Json = function_1.flow(cds.read, TE.map(cds.json));
        return function_1.pipe(
            args.cds,
            cds2Json,
            TE.chain(cds.write(args.output + ".json"))
        );
    };
};
var exec = function_1.flow(parse, TE.fromEither, TE.chain(run(cds_1._cds)));
var _log = function (left, right) {
    return TE.fold(
        function (e) {
            return TE.fromIO(left(e));
        },
        function (s) {
            return TE.fromIO(right(s));
        }
    );
};
exports.cli = {
    success: write,
    failure: exit,
    exec: exec,
    log: _log,
};
