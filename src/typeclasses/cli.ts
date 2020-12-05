import { Kind, Kind2, URIS, URIS2 } from "fp-ts/lib/HKT";

/**
 *
 *
 * @export
 * @interface CLI
 * @template A
 * @template B
 */
export interface CLI<A extends URIS, B extends URIS2> {
    /**
     *
     *
     * @memberof CLI
     */
    readonly log: (message: unknown) => Kind<A, void>;

    /**
     *
     *
     * @memberof CLI
     */
    readonly exit: (error: Error) => Kind<A, void>;

    /**
     *
     *
     * @memberof CLI
     */
    readonly run: (args: ReadonlyArray<string>) => Kind2<B, Error, string>;

    /**
     *
     *
     * @memberof CLI
     */
    readonly write: (
        left: (e: Error) => Kind<A, void>,
        right: (m: unknown) => Kind<A, void>
    ) => (result: Kind2<B, Error, string>) => Kind<A, void>;
}
