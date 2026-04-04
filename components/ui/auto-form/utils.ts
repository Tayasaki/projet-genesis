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

/**
 * Get the lowest level Zod type.
 * This will unpack optionals, refinements, etc.
 */
export function getBaseSchema<
  ChildType extends z.ZodAny | z.ZodObject<any, any> = z.ZodAny,
>(schema: ChildType | z.ZodType): ChildType | null {
  if (!schema) return null;
  if ("innerType" in schema._def) {
    return getBaseSchema((schema._def as any).innerType as ChildType);
  }
  if ("schema" in schema._def) {
    return getBaseSchema((schema._def as any).schema as ChildType);
  }

  return schema as ChildType;
}

/**
 * Get the type name of the lowest level Zod type.
 * This will unpack optionals, refinements, etc.
 */
export function getBaseType(schema: z.ZodAny): string {
  const baseSchema = getBaseSchema(schema);
  return baseSchema ? (baseSchema._def as any).typeName : "";
}

/**
 * Search for a "ZodDefault" in the Zod stack and return its value.
 */
export function getDefaultValueInZodStack(schema: z.ZodAny): any {
  const typedSchema = schema as unknown as z.ZodDefault<
    z.ZodNumber | z.ZodString
  >;
  const def = typedSchema._def as any;

  if (def.typeName === "ZodDefault") {
    return def.defaultValue();
  }

  if ("innerType" in typedSchema._def) {
    return getDefaultValueInZodStack(def.innerType as z.ZodAny);
  }
  if ("schema" in typedSchema._def) {
    return getDefaultValueInZodStack(def.schema as z.ZodAny);
  }

  return undefined;
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
  if ((schema?._def as any)?.typeName === "ZodEffects") {
    return getObjectFormSchema((schema._def as any).schema);
  }
  return schema as z.ZodObject<any, any>;
}

/**
 * Convert a Zod schema to HTML input props to give direct feedback to the user.
 * Once submitted, the schema will be validated completely.
 */
export function zodToHtmlInputProps(
  schema:
    | z.ZodNumber
    | z.ZodString
    | z.ZodOptional<z.ZodNumber | z.ZodString>
    | any,
): React.InputHTMLAttributes<HTMLInputElement> {
  const schemaDef = schema._def as any;
  if (["ZodOptional", "ZodNullable"].includes(schemaDef.typeName)) {
    return {
      ...zodToHtmlInputProps(schemaDef.innerType),
      required: false,
    };
  }
  const typedSchema = schema as z.ZodNumber | z.ZodString;
  const typedDef = typedSchema._def as any;

  if (!typedDef.checks)
    return {
      required: true,
    };

  const checks = typedDef.checks as any[];
  const inputProps: React.InputHTMLAttributes<HTMLInputElement> = {
    required: true,
  };
  const type = getBaseType(schema);

  for (const check of checks) {
    const c = check as any;
    if (c.kind === "min") {
      if (type === "ZodString") {
        inputProps.minLength = c.value;
      } else {
        inputProps.min = c.value;
      }
    }
    if (c.kind === "max") {
      if (type === "ZodString") {
        inputProps.maxLength = c.value;
      } else {
        inputProps.max = c.value;
      }
    }
  }

  return inputProps;
}
