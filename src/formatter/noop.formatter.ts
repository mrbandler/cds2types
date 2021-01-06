import { Formatter } from "./formatter";

/**
 * Prettier formatter.
 *
 * NOTE: Should be created like this => const formatter = await new NoopFormatter("./test.ts").init();
 *
 * @export
 * @class NoopFormatter
 * @extends {Formatter}
 */
export class NoopFormatter extends Formatter {
    /**
     * Initializes the formatter.
     *
     * @abstract
     * @returns {Promise<Formatter>} Initialized formatter
     * @memberof Formatter
     */
    public async init(): Promise<Formatter> {
        return this;
    }

    /**
     * Formats a given source code.
     *
     * @abstract
     * @param {string} source Source code to format
     * @returns {string} Formatted source code
     * @memberof Formatter
     */
    public format(source: string): string {
        return source;
    }
}
