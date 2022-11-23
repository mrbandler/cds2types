import cds from "@sap/cds";
import * as fs from "fs-extra";
import _ from "lodash";
import * as path from "path";
import * as morph from "ts-morph";
import { CDSParser } from "./cds.parser";
import { Formatter } from "./formatter/formatter";
import { NoopFormatter } from "./formatter/noop.formatter";
import { PrettierFormatter } from "./formatter/prettier.formatter";
import { BaseType } from "./types/base.type";
import { Namespace } from "./types/namespace";
import { ICsn, ICsnParam, Kind } from "./utils/cds.types";
import {
    IEntityDefinition,
    IOptions,
    IParsed,
    isActionFunction,
    isEntity,
    isEnum,
    isType,
    ITypeAliasDefinition,
    KindName,
} from "./utils/types";

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

        const namespaceNames = namespaces.map((ns) => ns.name);
        for (const namespace of namespaces) {
            const source = project.createSourceFile(
                options.output + namespace.name
            );
            const types = _.flatten(namespaces.map((n) => n.getTypes()));
            const elementsFromOtherNamespaces =
                this.findElementsFromOtherNamespaces(
                    namespace,
                    namespaceNames,
                    types
                );

            namespace.generateCode(
                source,
                options.prefix,
                namespaceNames,
                elementsFromOtherNamespaces.get(namespace.name),
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

    /**
     * Finds elements which are defined in another namespace as the current one.
     *
     * @private
     * @param {Namespace} namespace
     * @param {string[]} namespaceNames
     * @param {BaseType[]} types
     * @return {Map<string, KindName[]>}
     * @memberof Program
     */
    private findElementsFromOtherNamespaces(
        namespace: Namespace,
        namespaceNames: string[],
        types: BaseType[]
    ): Map<string, KindName[]> {
        const otherNamespaces = new Map<string, KindName[]>();
        otherNamespaces.set(namespace.name, []);

        for (const [key, value] of namespace.Definitions) {
            if (isType(value)) {
                this.checkTypeIfElementFromOtherNamespace(
                    namespaceNames,
                    value,
                    namespace,
                    types,
                    otherNamespaces
                );
            } else if (isEntity(value)) {
                this.checkEntityIfElementFromOtherNamespace(
                    value,
                    namespaceNames,
                    namespace,
                    types,
                    otherNamespaces
                );
            } else if (isEnum(value)) {
                // TODO: is this relevant for enums?
            } else if (isActionFunction(value)) {
                const params = value.params ? value.params : [];
                this.checkActionFunctionIfElementFromOtherNamespace(
                    params,
                    types,
                    namespaceNames,
                    namespace,
                    otherNamespaces
                );
            }
        }

        return otherNamespaces;
    }

    /**
     * Checks if entity has elements from other namespace as the current one.
     *
     * @private
     * @param {string[]} namespaceNames
     * @param {ITypeAliasDefinition} value
     * @param {Namespace} namespace
     * @param {BaseType<unknown>[]} types
     * @param {Map<string, KindName[]>} otherNamespaces
     * @memberof Program
     */
    private checkTypeIfElementFromOtherNamespace(
        namespaceNames: string[],
        value: ITypeAliasDefinition,
        namespace: Namespace,
        types: BaseType<unknown>[],
        otherNamespaces: Map<string, KindName[]>
    ) {
        const elementFromOtherNamespace = namespaceNames.find(
            (ns) =>
                value.type?.includes(ns) &&
                !value.type?.includes(namespace.name)
        );
        if (!_.isEmpty(elementFromOtherNamespace)) {
            if (value.type) {
                const relevantType = types.find((t) => t.Name === value.type);
                otherNamespaces.get(namespace.name)?.push({
                    kind: relevantType
                        ? relevantType.Definition?.kind
                        : Kind.Type,
                    name: value.type,
                });
            }
        }
    }

    /**
     * Checks if entity has elements from other namespace as the current one.
     *
     * @private
     * @param {IEntityDefinition} value
     * @param {string[]} namespaceNames
     * @param {Namespace} namespace
     * @param {BaseType<unknown>[]} types
     * @param {Map<string, KindName[]>} otherNamespaces
     * @memberof Program
     */
    private checkEntityIfElementFromOtherNamespace(
        value: IEntityDefinition,
        namespaceNames: string[],
        namespace: Namespace,
        types: BaseType<unknown>[],
        otherNamespaces: Map<string, KindName[]>
    ) {
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
                const relevantType = types.find((t) => t.Name === element.type);
                if (element.target) {
                    otherNamespaces.get(namespace.name)?.push({
                        kind: relevantType
                            ? relevantType.Definition?.kind
                            : Kind.Entity,
                        name: element.target,
                    });
                } else {
                    otherNamespaces.get(namespace.name)?.push({
                        kind: relevantType
                            ? relevantType.Definition?.kind
                            : Kind.Entity,
                        name: element.type,
                    });
                }
            }
        }
    }

    /**
     * Checks if action function has elements from other namespace as the current one.
     *
     * @private
     * @param {(Map<string, ITypeAliasDefinition | ICsnParam> | never[])} params
     * @param {BaseType<unknown>[]} types
     * @param {string[]} namespaceNames
     * @param {Namespace} namespace
     * @param {Map<string, KindName[]>} otherNamespaces
     * @memberof Program
     */
    private checkActionFunctionIfElementFromOtherNamespace(
        params: Map<string, ITypeAliasDefinition | ICsnParam> | never[],
        types: BaseType<unknown>[],
        namespaceNames: string[],
        namespace: Namespace,
        otherNamespaces: Map<string, KindName[]>
    ) {
        for (const [innerKey, param] of params) {
            if (param[0] && param[0].value) {
                const relevantType = types.find(
                    (t) => t.Name === param[0].value.type.ref[0]
                );
                const elementFromOtherNamespace = namespaceNames.find(
                    (ns) =>
                        param[0].value.type.ref[0].includes(ns) &&
                        !param[0].value.type.ref[0].includes(namespace.name)
                );
                if (!_.isEmpty(elementFromOtherNamespace)) {
                    otherNamespaces.get(namespace.name)?.push({
                        kind: relevantType
                            ? relevantType.Definition?.kind
                            : Kind.Action,
                        name: param[0].value.type.ref[0],
                    });
                }
            } else if (param.type && typeof param.type !== "string") {
                const elementFromOtherNamespace = namespaceNames.find((ns) =>
                    param.type
                        ? param.type["ref"][0].includes(ns) &&
                          !param.type["ref"][0].includes(namespace.name)
                        : false
                );
                const relevantType = types.find((t) =>
                    param.type ? t.Name === param.type["ref"][0] : false
                );
                if (!_.isEmpty(elementFromOtherNamespace)) {
                    otherNamespaces.get(namespace.name)?.push({
                        kind: relevantType
                            ? relevantType.Definition?.kind
                            : Kind.Action,
                        name: param.type["ref"][0],
                    });
                }
            }
        }
    }
}
