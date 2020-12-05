import { Kind, Kind2, URIS, URIS2 } from "fp-ts/lib/HKT";

/**
 * CLI typeclass.
 *
 * @export
 * @interface CLI
 * @template A URI of the kind to wrap single value side effects in
 * @template B URI of the kind to wrap tuple value side effects in
 */
export interface CLI<A extends URIS, B extends URIS2, E, S> {
    /**
     * Success handler.
     *
     * @memberof CLI
     */
    readonly success: (message: S) => Kind<A, void>;

    /**
     * Failure handler.
     *
     * @memberof CLI
     */
    readonly failure: (error: E) => Kind<A, void>;

    /**
     * Executes the CLI.
     *
     * @memberof CLI
     */
    readonly exec: (args: ReadonlyArray<string>) => Kind2<B, E, S>;

    /**
     * Logs a message to the user given the success and failure handlers and the exec result.
     *
     * @memberof CLI
     */
    readonly log: (
        left: (e: E) => Kind<A, void>,
        right: (s: S) => Kind<A, void>
    ) => (result: Kind2<B, E, S>) => Kind<A, void>;
}
