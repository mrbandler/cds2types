import * as morph from "ts-morph";

import { Definition, IEnumDefinition } from "../utils/types";
import { ICsnValue, Kind, Type } from "../utils/cds.types";

import {
    ActionFunction,
    IActionFunctionDeclarationStructure,
} from "./action.func";
import { Entity, IEntityDeclarationStructure } from "./entity";
import { Enum } from "./enum";
import _ from "lodash";
import { appendFileSync } from "fs-extra";

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
        blacklist: string[],
        interfacePrefix: string = "",
        name?: string
    ) {
        this._name = name;
        this.definitions = definitions;
        this.extractTypes(blacklist, interfacePrefix);
    }

    /**
     * Returns the entities in this namespace.
     *
     * @returns {Entity[]}
     * @memberof Namespace
     */
    public getEntities(): Entity[] {
        return this.entities;
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
        otherEntities: Entity[]
    ): void {
        const actionFuncDeclarations = this.actionFunctions.map((f) =>
            f.toType(otherEntities)
        );

        const enumDeclarations = this.enums.map((e) => e.toType());
        const entityDeclarations = this.entities.map((e) =>
            e.toType(otherEntities)
        );

        const entityEnumDeclaration = this.generateEntitiesEnum().toType();
        const sanitizedEntityEnumDeclaration = this.generateEntitiesEnum(
            true
        ).toType();

        let namespaceOrSource:
            | morph.SourceFile
            | morph.NamespaceDeclaration = source;
        if (this.name && this.name !== "") {
            namespaceOrSource = source.addNamespace({
                name: this.name,
                isExported: true,
            });
        }

        this.addActionFuncDeclarations(
            actionFuncDeclarations,
            namespaceOrSource
        );
        this.addEnumDeclarations(enumDeclarations, namespaceOrSource);
        this.addEntityDeclarations(entityDeclarations, namespaceOrSource);

        namespaceOrSource.addEnum(entityEnumDeclaration);
        namespaceOrSource.addEnum(sanitizedEntityEnumDeclaration);
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
                const actionsNamespace = source.addNamespace({
                    name: `${ed.interfaceDeclarationStructure.name}.actions`,
                    isExported: true,
                });

                this.addActionFuncDeclarations(
                    ed.actionFuncStructures,
                    actionsNamespace
                );
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
    private extractTypes(
        blacklist: string[],
        interfacePrefix: string = ""
    ): void {
        for (const [key, value] of this.definitions) {
            if (blacklist.map((b) => this.wilcard(b, key)).includes(true)) {
                continue;
            }

            switch (value.kind) {
                case Kind.Entity:
                    const entity = new Entity(
                        key,
                        value,
                        interfacePrefix,
                        this.name
                    );

                    this.entities.push(entity);

                    break;
                case Kind.Function:
                    const func = new ActionFunction(
                        key,
                        value,
                        value.kind,
                        interfacePrefix,
                        this.name
                    );

                    this.actionFunctions.push(func);

                    break;
                case Kind.Action:
                    const action = new ActionFunction(
                        key,
                        value,
                        value.kind,
                        interfacePrefix,
                        this.name
                    );

                    this.actionFunctions.push(action);

                    break;
                case Kind.Type:
                    if ((value as IEnumDefinition).enum) {
                        const _enum = new Enum(
                            key,
                            value as IEnumDefinition,
                            this.name
                        );
                        this.enums.push(_enum);
                    } else {
                        const entity = new Entity(
                            key,
                            value,
                            interfacePrefix,
                            this.name
                        );

                        this.entities.push(entity);
                    }

                    break;
            }
        }
    }

    /**
     * Checks a given string for a given GLOB wildcard.
     *
     * @private
     * @param {string} wildcard Wildcard to check against
     * @param {string} str String to check the wildcard against
     * @returns {boolean} Flag, whether the check was succsessful
     * @memberof Namespace
     */
    private wilcard(wildcard: string, str: string): boolean {
        const re = new RegExp(
            `^${wildcard.replace(/\*/g, ".*").replace(/\?/g, ".")}$`,
            "i"
        );
        return re.test(str);
    }

    /**
     * Generates the entities enumerations.
     *
     * @private
     * @param {boolean} [sanitized=false] Flag, whether the enum should represent sanitized entities
     * @returns {Enum} Generates enum
     * @memberof Namespace
     */
    private generateEntitiesEnum(sanitized: boolean = false): Enum {
        const definition: IEnumDefinition = {
            kind: Kind.Type,
            type: Type.String,
            enum: new Map<string, ICsnValue>(),
        };

        if (definition.enum) {
            for (const entity of this.entities) {
                definition.enum.set(entity.getSanitizedName(), {
                    val: sanitized
                        ? entity.getSanitizedName()
                        : entity.getModelName(),
                });
            }
        }

        return sanitized
            ? new Enum("SanitizedEntity", definition)
            : new Enum("Entity", definition);
    }
}
