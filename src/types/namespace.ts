import * as morph from "ts-morph";

import {
    Definition,
    IEnumDefinition,
    isActionFunction,
    isEntity,
    isEnum,
    isType,
    KindName,
} from "../utils/types";
import { ICsnValue, Kind, Type } from "../utils/cds.types";

import {
    ActionFunction,
    IActionFunctionDeclarationStructure,
} from "./action.func";
import { Entity, IEntityDeclarationStructure } from "./entity";
import { TypeAlias } from "./type.alias";
import { Enum } from "./enum";
import _ from "lodash";
import { BaseType } from "./base.type";

/**
 * Type that represents a namespace.
 *
 * Namespaces are used to generate the type definition in it.
 * So it is possible to create a namespace that represents the file itself, hence a namespaces without a name.
 *
 * @export
 * @class Namespace
 */
export class Namespace {
    /**
     * Namespace name.
     *
     * @private
     * @type {string}
     * @memberof Namespace
     */
    private _name?: string;

    /**
     * Namespaces type definitions.
     *
     * @private
     * @type {Map<string, IDefinition>}
     * @memberof Namespace
     */
    private definitions: Map<string, Definition>;

    /**
     * CDS entities.
     *
     * @private
     * @type {Entity[]}
     * @memberof Namespace
     */
    private entities: Entity[] = [];

    /**
     * CDS action and function imports.
     *
     * @private
     * @
     * @type {Function[]}
     * @memberof Namespace
     */
    private actionFunctions: ActionFunction[] = [];

    /**
     * CDS enums.
     *
     * @private
     * @type {Enum[]}
     * @memberof Namespace
     */
    private enums: Enum[] = [];

    /**
     * CDS type aliases.
     *
     * @private
     * @type {TypeAlias[]}
     * @memberof Namespace
     */
    private typeAliases: TypeAlias[] = [];

    /**
     * Name of the namespace.
     *
     * @readonly
     * @type {string}
     * @memberof Namespace
     */
    public get name(): string {
        return this._name ? this._name : "";
    }

    /**
     * Get definitions of namespace.
     *
     * @readonly
     * @type {string}
     * @memberof Namespace
     */
    public get Definitions(): Map<string, Definition> {
        return this.definitions;
    }

    /**
     * Default constructor.
     *
     * @param {Map<string, IDefinition>} definitions Namespaces definitions
     * @param {string[]} blacklist Blacklist
     * @param {string} [interfacePrefix=""] Interface prefix
     * @param {string} [name] Name of the namespace
     * @memberof Namespace
     */
    constructor(
        definitions: Map<string, Definition>,
        interfacePrefix = "",
        name?: string
    ) {
        this._name = name;
        this.definitions = definitions;
        this.extractTypes(interfacePrefix);
    }

    /**
     * Returns the entities in this namespace.
     *
     * @returns {Entity[]}
     * @memberof Namespace
     */
    public getTypes(): BaseType[] {
        const result: BaseType[] = [];

        result.push(...this.typeAliases);
        result.push(...this.enums);
        result.push(...this.entities);

        return result;
    }

    /**
     *  Generates the code for the type definitions in the namespace.
     *
     * @param {Entity[]} otherEntities Other entities from the file namespace or all other namespaces.
     * @returns {string} Typescript code.
     * @memberof Namespace
     */
    public generateCode(
        source: morph.SourceFile,
        interfacePrefix = "",
        allNamespaces: string[],
        elementsFromOtherNamespace: KindName[] | undefined,
        otherEntities: BaseType[]
    ): void {
        const actionFuncDeclarations = this.actionFunctions.map((f) =>
            f.toType(otherEntities)
        );

        const enumDeclarations = this.enums.map((e) => e.toType());
        const entityDeclarations = this.entities.map((e) =>
            e.toType(otherEntities)
        );

        const entityEnumDeclaration = this.generateEntitiesEnum().toType();
        const sanitizedEntityEnumDeclaration =
            this.generateEntitiesEnum(true).toType();

        const typeAliasDeclarations = this.typeAliases.map((t) =>
            t.toType(otherEntities)
        );

        const importMap = new Map<string, string[]>();
        if (!_.isNil(elementsFromOtherNamespace)) {
            for (const element of elementsFromOtherNamespace) {
                const relevantNamespace = allNamespaces.find((ns) =>
                    element.name.includes(ns)
                );

                if (!_.isNil(relevantNamespace)) {
                    if (_.isNil(importMap.get(relevantNamespace))) {
                        importMap.set(relevantNamespace, []);
                    }
                    let elementWithoutNamespace = element.name.replace(
                        `${relevantNamespace}.`,
                        ""
                    );

                    if (element.kind === Kind.Entity) {
                        elementWithoutNamespace = `${interfacePrefix}${elementWithoutNamespace}`;
                    }

                    const mapElement = importMap.get(relevantNamespace);
                    if (
                        !_.isNil(mapElement) &&
                        !mapElement.some(
                            (element) => element === elementWithoutNamespace
                        )
                    ) {
                        mapElement.push(elementWithoutNamespace);
                    }
                }
            }
        }

        for (const [key, element] of importMap) {
            source
                .addImportDeclaration({ moduleSpecifier: `./${key}` })
                .addNamedImports(element);
        }

        this.addTypeAliasDeclarations(typeAliasDeclarations, source);
        this.addEnumDeclarations(enumDeclarations, source);
        this.addEntityDeclarations(entityDeclarations, source);
        this.addActionFuncDeclarations(actionFuncDeclarations, source);

        source.addEnum(entityEnumDeclaration);
        source.addEnum(sanitizedEntityEnumDeclaration);
    }

    /**
     * Adds action/function declarations to a given source.
     *
     * @private
     * @param {IActionFunctionDeclarationStructure[]} actionFuncDecls Action/function declaration to add
     * @param {(morph.SourceFile | morph.NamespaceDeclaration)} source Source to add the action/function declaration to
     * @memberof Namespace
     */
    private addActionFuncDeclarations(
        actionFuncDecls: IActionFunctionDeclarationStructure[],
        source: morph.SourceFile | morph.NamespaceDeclaration
    ): void {
        actionFuncDecls.forEach((afd) => {
            source.addEnum(afd.enumDeclarationStructure);
            if (afd.interfaceDeclarationStructure) {
                source.addInterface(afd.interfaceDeclarationStructure);
            }

            if (afd.typeAliasDeclarationStructure) {
                source.addTypeAlias(afd.typeAliasDeclarationStructure);
            }
        });
    }

    /**
     * Adds a enum declarations to the given source
     *
     * @private
     * @param {(morph.SourceFile | morph.NamespaceDeclaration)} source Source to add the enum declartions to
     * @param {morph.EnumDeclarationStructure[]} enumDecls Enum declarations to add
     * @memberof Namespace
     */
    private addEnumDeclarations(
        enumDecls: morph.EnumDeclarationStructure[],
        source: morph.SourceFile | morph.NamespaceDeclaration
    ): void {
        enumDecls.forEach((ed) => {
            if (ed.members && !_.isEmpty(ed.members)) {
                source.addEnum(ed);
            }
        });
    }

    /**
     * Adds entity declarations to the given source.
     *
     * @private
     * @param {IEntityDeclarationStructure[]} entityDecls Entity declarations to add
     * @param {(morph.SourceFile | morph.NamespaceDeclaration)} source Source to add the entity declarations to
     * @memberof Namespace
     */
    private addEntityDeclarations(
        entityDecls: IEntityDeclarationStructure[],
        source: morph.SourceFile | morph.NamespaceDeclaration
    ): void {
        entityDecls.forEach((ed) => {
            if (!_.isEmpty(ed.enumDeclarationStructures)) {
                this.addEnumDeclarations(ed.enumDeclarationStructures, source);
            }

            source.addInterface(ed.interfaceDeclarationStructure);

            if (!_.isEmpty(ed.actionFuncStructures)) {
                this.addActionFuncDeclarations(ed.actionFuncStructures, source);
            }
        });
    }

    /**
     * Adds type alias declarations to the given source.
     *
     * @private
     * @param {morph.TypeAliasDeclarationStructure[]} typeAliasDecls Type alias declarations to add
     * @param {(morph.SourceFile | morph.NamespaceDeclaration)} source Source to add type alias declarations to
     * @memberof Namespace
     */
    private addTypeAliasDeclarations(
        typeAliasDecls: (morph.TypeAliasDeclarationStructure | undefined)[],
        source: morph.SourceFile | morph.NamespaceDeclaration
    ): void {
        typeAliasDecls.forEach((tad) => {
            if (tad !== undefined) {
                source.addTypeAlias(tad);
            }
        });
    }

    /**
     * Extracts the types from the namespace definitions.
     *
     * @private
     * @param {string[]} blacklist Blacklist an definition keys that should not be generated.
     * @param {string} [interfacePrefix=""] Interface prefix.
     * @memberof Namespace
     */
    private extractTypes(interfacePrefix = ""): void {
        for (const [key, value] of this.definitions) {
            if (value == undefined) continue;

            if (isType(value)) {
                const typeAlias = new TypeAlias(
                    key,
                    value,
                    // interfacePrefix,
                    this.name
                );

                this.typeAliases.push(typeAlias);
            } else if (isEntity(value)) {
                const entity = new Entity(
                    key,
                    value,
                    interfacePrefix,
                    this.name
                );

                this.entities.push(entity);
            } else if (isEnum(value)) {
                const _enum = new Enum(
                    key,
                    value as IEnumDefinition,
                    this.name
                );
                this.enums.push(_enum);
            } else if (isActionFunction(value)) {
                const actionFunction = new ActionFunction(
                    key,
                    value,
                    value.kind,
                    interfacePrefix,
                    this.name
                );

                this.actionFunctions.push(actionFunction);
            }
        }
    }

    /**
     * Generates the entities enumerations.
     *
     * @private
     * @param {boolean} [sanitized=false] Flag, whether the enum should represent sanitized entities
     * @returns {Enum} Generates enum
     * @memberof Namespace
     */
    private generateEntitiesEnum(sanitized = false): Enum {
        const definition: IEnumDefinition = {
            kind: Kind.Type,
            type: Type.String,
            enum: new Map<string, ICsnValue>(),
        };

        if (definition.enum) {
            for (const entity of this.entities) {
                definition.enum.set(entity.getSanitizedName(), {
                    val: sanitized ? entity.getSanitizedName() : entity.Name,
                });
            }
        }

        return sanitized
            ? new Enum("SanitizedEntity", definition)
            : new Enum("Entity", definition);
    }
}
