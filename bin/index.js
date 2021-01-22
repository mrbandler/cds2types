"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var function_1 = require("fp-ts/lib/function");
var cli_1 = require("./instances/cli");
var main = function (cli) {
    return function (args) {
        return function_1.pipe(
            args,
            cli.exec,
            cli.log(cli.failure, cli.success)
        );
    };
};
var entry = main(cli_1.cli)(process.argv);
entry();
