import _ from "lodash";
import cds from "@sap/cds";
import * as fs from "fs-extra";
import * as morph from "ts-morph";
import * as path from "path";
import {
    IOptions,
    IParsed,
    isActionFunction,
    isEntity,
    isEnum,
    isType,
    KindName,
} from "./utils/types";
import { CDSParser } from "./cds.parser";
import { ICsn } from "./utils/cds.types";
import { Namespace } from "./types/namespace";
import { Formatter } from "./formatter/formatter";
import { NoopFormatter } from "./formatter/noop.formatter";
import { PrettierFormatter } from "./formatter/prettier.formatter";

/**
 * Main porgram class.
 *
 * @export
 * @class Program
 */
export class Program {
    /**
     * Main method.
     *
     * @param {Command} options Parsed CLI options.
     * @memberof Program
     */
    public async run(options: IOptions): Promise<void> {
        // Load compiled CDS.
        const jsonObj = await this.loadCdsAndConvertToJSON(
            options.cds,
            options.sort
        );

        // Write the compiled CDS JSON to disc for debugging.
        if (options.json) {
            fs.writeFileSync(
                `${options.output}servicdefinitions.json`,
                JSON.stringify(jsonObj)
            );
        }

        // Parse compile CDS.
        const parsed = new CDSParser().parse(jsonObj as ICsn);

        // Initialize the formatter and retrieve its settings.
        const formatter = await this.createFormatter(options);
        const settings = formatter.getSettings();

        // Create ts-morph project and source file to write to.
        const project = new morph.Project({ manipulationSettings: settings });

        // Generate the actual source code.
        await this.generateCode(parsed, project, formatter, options);
    }

    /**
     * Creates a formatter based on given options.
     *
     * @private
     * @param {IOptions} options Options to create a formatter for
     * @returns {Promise<Formatter>} Created formatter
     * @memberof Program
     */
    private async createFormatter(options: IOptions): Promise<Formatter> {
        return options.format
            ? await new PrettierFormatter(options.output).init()
            : await new NoopFormatter(options.output).init();
    }

    /**
     * Loads a given CDS file and parses the compiled JSON to a object.
     *
     * @private
     * @param {string} path Path to load the CDS file from.
     * @returns {Promise<any>}
     * @memberof Program
     */
    private async loadCdsAndConvertToJSON(
        path: string,
        sort: boolean
    ): Promise<unknown> {
        const csn = await cds.load(path);

        const result: ICsn = JSON.parse(cds.compile.to.json(csn));

        if (sort) {
            result.definitions = Object.fromEntries(
                Object.entries(result.definitions).sort((key, value) =>
                    String(key[0]).localeCompare(value[0])
                )
            );
        }

        return result;
    }

    /**
     * Extracts the types from a parsed service and generates the Typescript code.
     *
     * @private
     * @param {IParsed} parsed Parsed definitions, services and namespaces
     * @param {morph.Project} project
     * @param {Formatter} formatter
     * @param {IOptions} options
     * @return {Promise<void>}
     * @memberof Program
     */
    private async generateCode(
        parsed: IParsed,
        project: morph.Project,
        formatter: Formatter,
        options: IOptions
    ): Promise<void> {
        const namespaces: Namespace[] = [];

        if (parsed.namespaces) {
            const ns = parsed.namespaces.map(
                (n) => new Namespace(n.definitions, options.prefix, n.name)
            );
            namespaces.push(...ns);
        }

        if (parsed.services) {
            const ns = parsed.services.map(
                (s) => new Namespace(s.definitions, options.prefix, s.name)
            );
            namespaces.push(...ns);
        }

        if (parsed.definitions) {
            const ns = new Namespace(parsed.definitions, options.prefix);
            namespaces.push(ns);
        }

        const otherNamespaces = new Map<string, KindName[]>();
        const namespaceNames = namespaces.map((ns) => ns.name);
        namespaceNames.forEach((ns) => {
            otherNamespaces.set(ns, []);
        });
        for (const namespace of namespaces) {
            const source = project.createSourceFile(
                options.output + namespace.name
            );
            const types = _.flatten(namespaces.map((n) => n.getTypes()));

            for (const [key, value] of namespace.Definitions) {
                if (isType(value)) {
                    const elementFromOtherNamespace = namespaceNames.find(
                        (ns) =>
                            value.type?.includes(ns) &&
                            !value.type?.includes(namespace.name)
                    );
                    if (!_.isEmpty(elementFromOtherNamespace)) {
                        if (value.type) {
                            const relevantType = types.find(
                                (t) => t.Name === value.type
                            );
                            otherNamespaces.get(namespace.name)?.push({
                                kind: relevantType
                                    ? relevantType.Definition?.kind
                                    : "type",
                                name: value.type,
                            });
                        }
                    }
                } else if (isEntity(value)) {
                    const elements = value.elements ? value.elements : [];
                    for (const [innerKey, element] of elements) {
                        const elementFromOtherNamespace = namespaceNames.find(
                            (ns) =>
                                (element.type?.includes(ns) &&
                                    !element.type?.includes(namespace.name)) ||
                                (element.target?.includes(ns) &&
                                    !element.target?.includes(namespace.name))
                        );
                        if (!_.isEmpty(elementFromOtherNamespace)) {
                            const relevantType = types.find(
                                (t) => t.Name === element.type
                            );
                            if (element.target) {
                                otherNamespaces.get(namespace.name)?.push({
                                    kind: relevantType
                                        ? relevantType.Definition?.kind
                                        : "entity",
                                    name: element.target,
                                });
                            } else {
                                otherNamespaces.get(namespace.name)?.push({
                                    kind: relevantType
                                        ? relevantType.Definition?.kind
                                        : "entity",
                                    name: element.type,
                                });
                            }
                        }
                    }
                } else if (isEnum(value)) {
                    // t.b.d
                } else if (isActionFunction(value)) {
                    const params = value.params ? value.params : [];
                    for (const [innerKey, param] of params) {
                        if (param[0] && param[0].value) {
                            const relevantType = types.find(
                                (t) => t.Name === param[0].value.type.ref[0]
                            );
                            const elementFromOtherNamespace =
                                namespaceNames.find(
                                    (ns) =>
                                        param[0].value.type.ref[0].includes(
                                            ns
                                        ) &&
                                        !param[0].value.type.ref[0].includes(
                                            namespace.name
                                        )
                                );
                            if (!_.isEmpty(elementFromOtherNamespace)) {
                                otherNamespaces.get(namespace.name)?.push({
                                    kind: relevantType
                                        ? relevantType.Definition?.kind
                                        : "action",
                                    name: param[0].value.type.ref[0],
                                });
                            }
                        } else if (
                            param.type &&
                            typeof param.type !== "string"
                        ) {
                            const elementFromOtherNamespace =
                                namespaceNames.find((ns) =>
                                    param.type
                                        ? param.type["ref"][0].includes(ns) &&
                                          !param.type["ref"][0].includes(
                                              namespace.name
                                          )
                                        : false
                                );
                            const relevantType = types.find((t) =>
                                param.type
                                    ? t.Name === param.type["ref"][0]
                                    : false
                            );
                            if (!_.isEmpty(elementFromOtherNamespace)) {
                                otherNamespaces.get(namespace.name)?.push({
                                    kind: relevantType
                                        ? relevantType.Definition?.kind
                                        : "action",
                                    name: param.type["ref"][0],
                                });
                            }
                        }
                    }
                }
            }

            namespace.generateCode(
                source,
                options.prefix,
                namespaceNames,
                otherNamespaces.get(namespace.name),
                types
            );

            // Write the actual source file.
            const namespaceName = _.isEmpty(namespace.name)
                ? "other"
                : namespace.name;
            await this.writeSource(
                options.output,
                namespaceName,
                source.getFullText()
            );
        }

        await this.formatWrittenFiles(namespaceNames, options, formatter);
    }

    /**
     * Formats the written ts files and organizes imports.
     *
     * @private
     * @param {string[]} namespaceNames
     * @param {IOptions} options
     * @param {Formatter} formatter
     * @return {Promise<void>}
     * @memberof Program
     */
    private async formatWrittenFiles(
        namespaceNames: string[],
        options: IOptions,
        formatter: Formatter
    ): Promise<void> {
        console.log(`Unformatted files written.`);
        const formatProject = new morph.Project({
            manipulationSettings: formatter.getSettings(),
        });
        for (const namespace of namespaceNames) {
            const namespaceName = _.isEmpty(namespace) ? "other" : namespace;
            const file = formatProject.addSourceFileAtPath(
                `${options.output}${namespaceName}.ts`
            );
            if (file) {
                let fileWithFixedImports = file
                    .fixMissingImports()
                    .fixUnusedIdentifiers();
                fileWithFixedImports.formatText();
                const formattedText = await formatter.format(
                    fileWithFixedImports.getFullText()
                );
                await this.writeSource(
                    options.output,
                    namespaceName,
                    formattedText
                );
            }
        }
        console.log(`Formatted files written.`);
    }

    /**
     * Writes the types to disk.
     *
     * @private
     * @param {string} filepath File path to save the types at
     * @param {string} namespaceName
     * @param {string} source
     * @return {Promise<void>}
     * @memberof Program
     */
    private async writeSource(
        filepath: string,
        namespaceName: string,
        source: string
    ): Promise<void> {
        const dir = path.dirname(filepath);
        if (fs.existsSync(dir)) {
            const fullPath = `${filepath}${namespaceName}.ts`;
            // Remove the output file if it already exists.
            fs.removeSync(fullPath);
            await fs.writeFile(fullPath, source);

            console.log(`Wrote types to '${fullPath}'`);
        } else {
            console.error(
                `Unable to write types: '${dir}' is not a valid directory`
            );

            process.exit(-1);
        }
    }
}
