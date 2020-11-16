import { Option } from "fp-ts/lib/Option";
import { Kind, Parameters, ReturnType } from "./core";

/**
 * CDS action.
 *
 * @export
 * @interface Action
 */
export interface Action {
    readonly kind: Kind;
    readonly params: Option<Parameters>;
    readonly returns: Option<ReturnType>;
}
