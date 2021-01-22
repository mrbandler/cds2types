import { Option } from "fp-ts/lib/Option";
import { Elements, Kind } from "./core";
import { Action } from "./action";
import { Func } from "./func";

/**
 * CDS bound actions.
 *
 * @export
 */
export type Actions = {
    readonly [name: string]: Action | Func;
};

/**
 * CDS entity definition.
 *
 * @export
 */
export type Entity = {
    readonly kind: Kind;
    readonly "@readonly": boolean;
    readonly elements: Elements;
    readonly actions: Option<Actions>;
    readonly includes: Option<ReadonlyArray<string>>;
};
