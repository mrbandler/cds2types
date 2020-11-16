/**
 * Command-line arguments.
 *
 * @export
 * @interface Arguments
 */
export interface Arguments {
    readonly cds: string;
    readonly output: string;
    readonly prefix: string;
    readonly json: boolean;
    readonly version: string;
}
