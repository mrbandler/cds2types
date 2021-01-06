import { Formatter } from "./formatter";

/**
 * ESLint formatter.
 *
 * NOTE: Should be created like this => const formatter = await new ESLintFormatter("./test.ts").init();
 *
 * @export
 * @class ESLintFormatter
 * @extends {Formatter}
 */
export class ESLintFormatter extends Formatter {
    /**
     * Initializes the formatter.
     *
     * @returns {*}  {Promise<ESLintFormatter>}
     * @memberof ESLintFormatter
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
