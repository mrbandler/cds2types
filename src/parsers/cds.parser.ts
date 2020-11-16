import { Either, left, right } from "fp-ts/lib/Either";
import { Newtype, iso } from "newtype-ts";

import * as cds from "../domain/cds";
import * as ts from "../domain/ts";

interface DefinitionName extends Newtype<{ readonly name: unique symbol }, string> {}
const isoDefinitionName = iso<DefinitionName>();

interface NamedDefinition {
    readonly name: DefinitionName;
    readonly definition: cds.Definition;
}

const extractDefinitions = (cds: cds.CDS): ReadonlyArray<NamedDefinition> => {
    return Object.keys(cds).map(k => {
        return {
            name: isoDefinitionName.wrap(k),
            definition: cds[k as string] as cds.Definition,
        };
    });
};

const containsNamespace = (name: DefinitionName): boolean => isoDefinitionName.unwrap(name).split(".").length > 0;

const namespaceDefinitions = (defs: ReadonlyArray<NamedDefinition>): ReadonlyArray<NamedDefinition> =>
    defs.filter(def => containsNamespace(def.name));

const globalDefinitions = (defs: ReadonlyArray<NamedDefinition>): ReadonlyArray<NamedDefinition> =>
    defs.filter(def => !containsNamespace(def.name));

/**
 *
 *
 * @param {cds.CDS} cds
 * @returns {Either<string, ts.Parsed>}
 */
export const parse = (cds: cds.CDS): Either<string, ts.Parsed> => {
    const definitions = extractDefinitions(cds);
    const namespaceDefs = namespaceDefinitions(definitions);
    const globalDefs = globalDefinitions(definitions);

    return left("Unable to parse CDS");
};
