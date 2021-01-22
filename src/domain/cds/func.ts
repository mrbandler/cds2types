import { Option } from "fp-ts/lib/Option";
import { Kind, Parameters, ReturnType } from "./core";

/**
 * CDS function.
 *
 * @export
 */
export type Func = {
    readonly kind: Kind;
    readonly params: Option<Parameters>;
    readonly returns: Option<ReturnType>;
};
