import { TypeToken } from "../utils/type.constants";
import {
    IDefinition,
    CDSType,
    IElement,
    CDSCardinality,
    CDSKind,
} from "../utils/cds";
import { BaseType } from "./base.type";
import { Enum } from "./enum";
import { fork } from "cluster";

/**
 * Type that represents a CDS entity.
 *
 * Will be converted into a Typescript interface.
 *
 * @export
 * @class Entity
 * @extends {BaseType}
 */
export class Entity extends BaseType<Entity> {
    /**
     * Default constructor.
     * @param {string} name Name of the entity
     * @param {IDefinition} definition CDS entity definition
     * @param {string} [prefix=""] Interface prefix
     * @memberof Entity
     */
    constructor(name: string, definition: IDefinition, prefix: string = "") {
        super(name, definition, prefix);
    }

    /**
     * Converts the entity to a Typescript type.
     *
     * @returns {string}
     * @memberof Entity
     */
    public toType(types: Entity[]): string {
        let result = "";

        const ext = this.getExtensionInterfaces(types);
        const extFields = this.getExtensionInterfaceFields(types);

        let code: string[] = [];
        let enumCode: string[] = [];

        code.push(this.createInterface(ext));
        if (this.definition.elements) {
            for (const [key, value] of this.definition.elements) {
                if (value.enum) {
                    const enumName =
                        this.sanitizeName(this.sanitizeTarget(this.name)) +
                        this.sanitizeName(key);
                    const definition: IDefinition = {
                        kind: CDSKind.type,
                        type: value.type,
                        enum: value.enum,
                    };

                    const enumType = new Enum(enumName, definition);
                    enumCode.push(enumType.toType());

                    code.push(
                        this.createInterfaceField(key, value, this.prefix)
                    );
                } else {
                    if (!extFields.includes(key)) {
                        code.push(
                            this.createInterfaceField(key, value, this.prefix)
                        );
                    }
                }
            }
        }
        code.push(`${TypeToken.curlyBraceRight}`);

        result =
            enumCode.length > 0
                ? enumCode.join("\n") + "\n\n" + code.join("\n")
                : code.join("\n");
        return result;
    }

    /**
     * Returns the sanitized name of the entity.
     *
     * @returns {string} Sanitized name of the entity
     * @memberof Entity
     */
    public getSanitizedName(): string {
        return this.sanitizeName(this.sanitizeTarget(this.name));
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

        if (this.definition.elements) {
            result = Array.from(this.definition.elements.keys());
        }

        return result;
    }

    /**
     * Returns all interfaces that this entity extends from
     *
     * @private
     * @param {Entity[]} types All other entity types
     * @returns {(string[] | undefined)} List of all extended types
     * @memberof Entity
     */
    private getExtensionInterfaces(types: Entity[]): string[] | undefined {
        let result: string[] | undefined = undefined;

        if (this.definition.includes) {
            const ext = this.definition.includes[0];
            const entities = types.filter(e =>
                this.definition.includes
                    ? this.definition.includes.includes(e.name)
                    : false
            );

            if (entities) {
                result = entities.map(e => e.getSanitizedName());
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

        if (this.definition.includes) {
            const ext = this.definition.includes;
            const entities = types.filter(e =>
                this.definition.includes
                    ? this.definition.includes.includes(e.name)
                    : false
            );
            if (entities) {
                for (const entity of entities) {
                    result.push(...entity.getFields());
                }
            }
        }

        return result;
    }
}
