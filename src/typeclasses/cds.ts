import { Kind2, URIS2 } from "fp-ts/HKT";
import { CSN } from "@sap/cds-reflect/apis/csn";

/**
 * CDS typeclass.
 *
 * @export
 * @interface CDS
 * @template A URI of the kind to wrap a tuple valued side effect
 */
export type CDS<A extends URIS2> = {
    /**
     * Reads CDS from a given file path and returns the read CSN.
     *
     * @memberof CDS
     */
    readonly read: (path: string) => Kind2<A, Error, CSN>;

    /**
     * Converts given CSN object to JSON.
     *
     * @memberof CDS
     */
    readonly json: (csn: CSN) => JSON;

    /**
     * Writes a given JSON object to a file.
     *
     * @memberof CDS
     */
    readonly write: (path: string) => (json: JSON) => Kind2<A, Error, string>;
};
