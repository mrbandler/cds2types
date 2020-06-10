import * as morph from "ts-morph";

import { Cardinality, Kind } from "../utils/cds.types";
import { IElement, IEntityDefinition, IEnumDefinition } from "../utils/types";

import { BaseType } from "./base.type";
import { Enum } from "./enum";

/**
 * Entity toType return type.
 *
 * @export
 * @interface IEntityDeclarationStructure
 */
export interface IEntityDeclarationStructure {
    interfaceDeclarationStructure: morph.InterfaceDeclarationStructure;
    enumDeclarationStructures: morph.EnumDeclarationStructure[];
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
export class Entity extends BaseType<Entity, IEntityDeclarationStructure> {
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
        prefix: string = "",
        namespace: string = ""
    ) {
        super(name, definition, prefix, namespace);
    }

    /**
     * Converts the entity to a Typescript type.
     *
     * @returns {string}
     * @memberof Entity
     */
    public toType(types: Entity[]): IEntityDeclarationStructure {
        const ext = this.getExtensionInterfaces(types);
        const extFields = this.getExtensionInterfaceFields(types);

        let result: IEntityDeclarationStructure = {
            interfaceDeclarationStructure: this.createInterface("", "", ext),
            enumDeclarationStructures: [],
        };

        if (this.def.elements) {
            for (const [key, value] of this.def.elements) {
                if (value.enum) {
                    result.enumDeclarationStructures.push(
                        this.createEnumDeclaration(key, value)
                    );

                    result.interfaceDeclarationStructure.properties?.push(
                        this.createInterfaceField(
                            key,
                            value,
                            this.prefix
                        ) as morph.PropertySignatureStructure
                    );
                } else {
                    if (!extFields.includes(key)) {
                        result.interfaceDeclarationStructure.properties?.push(
                            this.createInterfaceField(
                                key,
                                value,
                                this.prefix
                            ) as morph.PropertySignatureStructure
                        );

                        if (
                            value.cardinality &&
                            value.cardinality.max === Cardinality.one
                        ) {
                            result.interfaceDeclarationStructure.properties?.push(
                                ...(this.getAssociationRefField(
                                    types,
                                    key,
                                    "_",
                                    value
                                ) as morph.PropertySignatureStructure[])
                            );
                        }
                    }
                }
            }
        }

        return result;
    }

    /**
     * Returns the sanitized name of the entity.
     *
     * @returns {string} Sanitized name of the entity
     * @memberof Entity
     */
    public getSanitizedName(
        withPrefix: boolean = false,
        withNamespace: boolean = false
    ): string {
        let name = this.sanitizeName(this.sanitizeTarget(this.name));

        if (withPrefix) {
            name = this.prefix + name;
        }

        if (withNamespace && (this.namespace || this.namespace !== "")) {
            name = this.namespace + "." + name;
        }

        return name;
    }

    /**
     * Returns the model name of the entity.
     *
     * @returns {string} Model name of the entity
     * @memberof Entity
     */
    public getModelName(): string {
        return this.name;
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
        value: any
    ): morph.EnumDeclarationStructure {
        const enumName =
            this.sanitizeName(this.sanitizeTarget(this.name)) +
            this.sanitizeName(key);
        const definition: IEnumDefinition = {
            kind: Kind.Type,
            type: value.type,
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
    private getExtensionInterfaces(types: Entity[]): string[] | undefined {
        let result: string[] | undefined = undefined;

        if (this.def.includes) {
            const entities = types.filter((e) =>
                this.def.includes ? this.def.includes.includes(e.name) : false
            );

            if (entities) {
                result = entities.map((e) => e.getSanitizedName(true, true));
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
    private getExtensionInterfaceFields(types: Entity[]): string[] {
        let result: string[] = [];

        if (this.def.includes) {
            const entities = types.filter((e) =>
                this.def.includes ? this.def.includes.includes(e.name) : false
            );
            if (entities) {
                for (const entity of entities) {
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
        types: Entity[],
        name: string,
        suffix: string,
        element: IElement
    ): morph.InterfaceMemberStructures[] {
        let result: morph.InterfaceMemberStructures[] = [];

        if (element.target && element.keys) {
            const entity = types.find(
                (t) => element.target === t.getModelName()
            );
            if (entity && entity.def.elements) {
                for (const key of element.keys) {
                    for (const [k, v] of entity.def.elements) {
                        if (k === key.ref[0]) {
                            result.push({
                                kind: morph.StructureKind.PropertySignature,
                                name: `${name}${suffix}${k}`,
                                hasQuestionToken: true,
                                type: this.cdsTypeToType(v.type),
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
