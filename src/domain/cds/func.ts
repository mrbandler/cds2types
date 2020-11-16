import { Option } from "fp-ts/lib/Option";
import { Kind, Parameters, ReturnType } from "./core";

/**
 * CDS function.
 *
 * @export
 * @interface Func
 */
export interface Func {
    readonly kind: Kind;
    readonly params: Option<Parameters>;
    readonly returns: Option<ReturnType>;
}
