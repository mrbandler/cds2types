import * as morph from "ts-morph";

import { Cardinality, Kind, Type } from "../utils/cds.types";
import { IElement, IEntityDefinition, IEnumDefinition } from "../utils/types";

import { BaseType } from "./base.type";
import { Enum } from "./enum";
import {
    ActionFunction,
    IActionFunctionDeclarationStructure,
} from "./action.func";

/**
 * Entity toType return type.
 *
 * @export
 * @interface IEntityDeclarationStructure
 */
export interface IEntityDeclarationStructure {
    interfaceDeclarationStructure: morph.InterfaceDeclarationStructure;
    enumDeclarationStructures: morph.EnumDeclarationStructure[];
    actionFuncStructures: IActionFunctionDeclarationStructure[];
}

/**
 * Type that represents a CDS entity.
 *
 * Will be converted into a Typescript interface.
 *
 * @export
 * @class Entity
 * @extends {BaseType}
 */
export class Entity extends BaseType<IEntityDeclarationStructure> {
    private get def(): IEntityDefinition {
        return this.definition as IEntityDefinition;
    }

    /**
     * Default constructor.
     *
     * @param {string} name Name of the entity
     * @param {IDefinition} definition CDS entity definition
     * @param {string} [prefix=""] Interface prefix
     * @param {string} [namespace=""] Namespace this entity belongs to
     * @memberof Entity
     */
    constructor(
        name: string,
        definition: IEntityDefinition,
        prefix = "",
        namespace = ""
    ) {
        super(name, definition, prefix, namespace);
    }

    /**
     * Converts the entity to a Typescript type.
     *
     * @returns {string}
     * @memberof Entity
     */
    public toType(types: BaseType[]): IEntityDeclarationStructure {
        const ext = this.getExtensionInterfaces(types);
        const extFields = this.getExtensionInterfaceFields(types);

        const result: IEntityDeclarationStructure = {
            interfaceDeclarationStructure: this.createInterface("", "", ext),
            enumDeclarationStructures: [],
            actionFuncStructures: [],
        };

        if (this.def.elements) {
            const interfaceName = this.sanitizeName(
                this.sanitizeTarget(this.name)
            );
            for (const [key, value] of this.def.elements) {
                if (value.enum) {
                    result.enumDeclarationStructures.push(
                        this.createEnumDeclaration(key, value)
                    );

                    result.interfaceDeclarationStructure.properties?.push(
                        this.createInterfaceField(
                            key,
                            value,
                            types,
                            interfaceName,
                            this.prefix
                        ) as morph.PropertySignatureStructure
                    );
                } else {
                    if (!extFields.includes(key)) {
                        const field = this.createInterfaceField(
                            key,
                            value,
                            types,
                            interfaceName,
                            this.prefix
                        );
                        result.interfaceDeclarationStructure.properties?.push(
                            field
                        );

                        if (
                            value.cardinality &&
                            value.cardinality.max === Cardinality.one
                        ) {
                            const fields = this.getAssociationRefField(
                                types,
                                key,
                                "_",
                                value
                            );
                            result.interfaceDeclarationStructure.properties?.push(
                                ...fields
                            );
                        }
                    }
                }
            }
        }

        if (this.def.actions) {
            for (const [key, value] of this.def.actions) {
                const actionFunc = new ActionFunction(
                    key,
                    value,
                    value.kind,
                    this.prefix,
                    this.name
                );
                const actionFuncDeclaration = actionFunc.toType(types);

                result.actionFuncStructures.push(actionFuncDeclaration);
            }
        }

        return result;
    }

    /**
     * Returns the fields of the entity.
     *
     * @returns {string[]} List of all field names
     * @memberof Entity
     */
    public getFields(): string[] {
        let result: string[] = [];

        if (this.def.elements) {
            result = Array.from(this.def.elements.keys());
        }

        return result;
    }

    /**
     * Returns a element by name.
     *
     * @param {string} name Name of the element to return
     * @returns {(IElement | undefined)} Found element
     * @memberof Entity
     */
    public getElement(name: string): IElement | undefined {
        return this.def.elements?.get(name);
    }

    /**
     * Creates a enum declaration from a given enum interface element.
     *
     * @private
     * @param {string} key Key of the element
     * @param {*} value Value of the element
     * @returns {morph.EnumDeclarationStructure} Created enum declaration
     * @memberof Entity
     */
    private createEnumDeclaration(
        key: string,
        value: IElement
    ): morph.EnumDeclarationStructure {
        const enumName =
            this.sanitizeName(this.sanitizeTarget(this.name)) +
            this.sanitizeName(key);
        const definition: IEnumDefinition = {
            kind: Kind.Type,
            type: value.type as Type,
            enum: value.enum,
        };

        const enumType = new Enum(enumName, definition);
        return enumType.toType();
    }

    /**
     * Returns all interfaces that this entity extends from.
     *
     * @private
     * @param {Entity[]} types All other entity types
     * @returns {(string[] | undefined)} List of all extended types
     * @memberof Entity
     */
    private getExtensionInterfaces(types: BaseType[]): string[] | undefined {
        let result: string[] | undefined = undefined;

        if (this.def.includes) {
            const entities = types.filter((e) =>
                this.def.includes ? this.def.includes.includes(e.Name) : false
            );

            if (entities) {
                result = entities.map((e) => e.getSanitizedName(false, true));
            }
        }

        return result;
    }

    /**
     * Returns all fields from the extended interfaces.
     *
     * @private
     * @param {Entity[]} types All other entity types
     * @returns {string[]} List of all fields
     * @memberof Entity
     */
    private getExtensionInterfaceFields(types: BaseType[]): string[] {
        const result: string[] = [];

        if (this.def.includes) {
            const filtered = types
                .filter((e) =>
                    this.def.includes
                        ? this.def.includes.includes(e.Name)
                        : false
                )
                .filter((f) => f instanceof Entity) as Entity[];
            if (filtered) {
                for (const entity of filtered) {
                    result.push(...entity.getFields());
                }
            }
        }

        return result;
    }

    /**
     * Returns all association reference field.
     *
     * @private
     * @param {Entity[]} types Types to check for
     * @param {string} name Name of the field
     * @param {string} suffix Name suffix
     * @param {IElement} element Element which represents the field
     * @returns {morph.InterfaceMemberStructures[]} Created association ref field
     * @memberof Entity
     */
    private getAssociationRefField(
        types: BaseType[],
        name: string,
        suffix: string,
        element: IElement
    ): morph.PropertySignatureStructure[] {
        const result: morph.PropertySignatureStructure[] = [];

        if (element.target && element.keys) {
            const type = types.find((t) => element.target === t.Name);
            if (type && type instanceof Entity && type.def.elements) {
                for (const key of element.keys) {
                    for (const [k, v] of type.def.elements) {
                        if (k === key.ref[0]) {
                            result.push({
                                kind: morph.StructureKind.PropertySignature,
                                name: `${name}${suffix}${k}`,
                                hasQuestionToken: true,
                                type: this.resolveType(v.type, types),
                            });

                            break;
                        }
                    }
                }
            }
        }

        return result;
    }
}
