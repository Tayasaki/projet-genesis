import React from "react";
import { DefaultValues } from "react-hook-form";
import { z } from "zod";

// TODO: This should support recursive ZodEffects but TypeScript doesn't allow circular type definitions.
// Zod v4: ZodEffects no longer exported, use ZodType as the wrapped variant.
export type ZodObjectOrWrapped = z.ZodObject<any, any> | z.ZodType;

/**
 * Beautify a camelCase string.
 * e.g. "myString" -> "My String"
 */
export function beautifyObjectName(string: string) {
  // if numbers only return the string
  let output = string.replace(/([A-Z])/g, " $1");
  output = output.charAt(0).toUpperCase() + output.slice(1);
  return output;
}

type ZodSchema = z.core.$ZodType;

/**
 * Zod 4 stores the schema kind in `_zod.def.type` (lowercase, e.g. "enum").
 * The handler tables in `config.ts` keep their historical `Zod*` keys, so
 * every kind lookup goes through this one mapping instead of reading zod
 * internals at each call site.
 */
export function getSchemaKind(schema: ZodSchema): string {
  const { type } = schema._zod.def;
  return `Zod${type.charAt(0).toUpperCase()}${type.slice(1)}`;
}

/**
 * The schema wrapped by a modifier (optional, nullable, default, readonly,
 * catch, pipe/transform input, ...), or null for a base schema.
 * Refinements are checks in zod 4 and never wrap the schema.
 */
function getWrappedSchema(schema: ZodSchema): ZodSchema | null {
  const def = schema._zod.def;
  if ("innerType" in def) return def.innerType as ZodSchema;
  if (def.type === "pipe") return (def as z.core.$ZodPipeDef).in;
  return null;
}

/**
 * Get the lowest level Zod type.
 * This will unpack optionals, defaults, transforms, etc.
 */
export function getBaseSchema<
  ChildType extends z.ZodAny | z.ZodObject<any, any> = z.ZodAny,
>(schema: ChildType | z.ZodType): ChildType | null {
  if (!schema) return null;
  const wrapped = getWrappedSchema(schema);
  return wrapped ? getBaseSchema(wrapped as ChildType) : (schema as ChildType);
}

/**
 * Get the kind ("ZodEnum", "ZodNumber", ...) of the lowest level Zod type.
 */
export function getBaseType(schema: z.ZodAny): string {
  const baseSchema = getBaseSchema(schema);
  return baseSchema ? getSchemaKind(baseSchema) : "";
}

/**
 * `.describe("x").optional()` wraps a described schema in a fresh one that
 * carries no metadata, so the label has to be searched down the wrapper chain.
 */
export function getSchemaDescription(schema: ZodSchema): string | undefined {
  const own = (schema as z.ZodType).description;
  if (own !== undefined) return own;
  const wrapped = getWrappedSchema(schema);
  return wrapped ? getSchemaDescription(wrapped) : undefined;
}

/**
 * Options of an enum schema, whatever wrappers surround it.
 */
export function getEnumOptions(schema: z.ZodType): string[] {
  const base = getBaseSchema(schema as z.ZodAny);
  return base && getSchemaKind(base) === "ZodEnum"
    ? ((base as unknown as z.ZodEnum).options as string[])
    : [];
}

/**
 * Number inputs yield strings: turn on zod's own coercion for the underlying
 * number schema so the resolver validates (and submits) a number.
 */
export function enableNumberCoercion(schema: z.ZodType): void {
  const base = getBaseSchema(schema as z.ZodAny);
  if (base && getSchemaKind(base) === "ZodNumber") {
    (base._zod.def as { coerce?: boolean }).coerce = true;
  }
}

/**
 * Search for a "default" in the Zod stack and return its value.
 */
export function getDefaultValueInZodStack(schema: ZodSchema): any {
  if (schema._zod.def.type === "default") {
    return (schema._zod.def as z.core.$ZodDefaultDef).defaultValue;
  }
  const wrapped = getWrappedSchema(schema);
  return wrapped ? getDefaultValueInZodStack(wrapped) : undefined;
}

/**
 * Get all default values from a Zod schema.
 */
export function getDefaultValues<Schema extends z.ZodObject<any, any>>(
  schema: Schema,
) {
  if (!schema) return null;
  const { shape } = schema;
  type DefaultValuesType = DefaultValues<Partial<z.infer<Schema>>>;
  const defaultValues = {} as DefaultValuesType;
  if (!shape) return defaultValues;

  for (const key of Object.keys(shape)) {
    const item = shape[key] as z.ZodAny;

    if (getBaseType(item) === "ZodObject") {
      const defaultItems = getDefaultValues(
        getBaseSchema(item) as unknown as z.ZodObject<any, any>,
      );

      if (defaultItems !== null) {
        for (const defaultItemKey of Object.keys(defaultItems)) {
          const pathKey = `${key}.${defaultItemKey}` as keyof DefaultValuesType;
          defaultValues[pathKey] = defaultItems[defaultItemKey] as any;
        }
      }
    } else {
      const defaultValue = getDefaultValueInZodStack(item);
      if (defaultValue !== undefined) {
        defaultValues[key as keyof DefaultValuesType] = defaultValue;
      }
    }
  }

  return defaultValues;
}

export function getObjectFormSchema(
  schema: ZodObjectOrWrapped,
): z.ZodObject<any, any> {
  return (getBaseSchema(schema as z.ZodAny) ??
    schema) as unknown as z.ZodObject<any, any>;
}

/**
 * Convert a Zod schema to HTML input props to give direct feedback to the user.
 * Once submitted, the schema will be validated completely.
 */
export function zodToHtmlInputProps(
  schema: z.ZodType,
): React.InputHTMLAttributes<HTMLInputElement> {
  const def = schema._zod.def;
  if (def.type === "optional" || def.type === "nullable") {
    return {
      ...zodToHtmlInputProps(
        (def as z.core.$ZodOptionalDef).innerType as z.ZodType,
      ),
      required: false,
    };
  }

  const inputProps: React.InputHTMLAttributes<HTMLInputElement> = {
    required: true,
  };
  const checks = (def as z.core.$ZodStringDef | z.core.$ZodNumberDef).checks;
  const isString = def.type === "string";

  for (const check of checks ?? []) {
    const checkDef = check._zod.def as {
      check: string;
      value?: number;
      minimum?: number;
      maximum?: number;
    };
    switch (checkDef.check) {
      case "min_length":
        inputProps.minLength = checkDef.minimum;
        break;
      case "max_length":
        inputProps.maxLength = checkDef.maximum;
        break;
      case "greater_than":
        if (!isString) inputProps.min = checkDef.value;
        break;
      case "less_than":
        if (!isString) inputProps.max = checkDef.value;
        break;
    }
  }

  return inputProps;
}
