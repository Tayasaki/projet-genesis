"use client";
import { Form } from "@/components/ui/form";
import React from "react";
import { DefaultValues, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";

import AutoFormObject from "./fields/object";
import { Dependency, FieldConfig } from "./types";
import {
  ZodObjectOrWrapped,
  getDefaultValues,
  getObjectFormSchema,
} from "./utils";

export function AutoFormSubmit({
  children,
  className,
  isLoading,
}: {
  children?: React.ReactNode;
  className?: string;
  isLoading: boolean;
}) {
  return (
    <Button isLoading={isLoading} type="submit" className={className}>
      {children ?? "Submit"}
    </Button>
  );
}

function AutoForm<SchemaType extends ZodObjectOrWrapped>({
  formSchema,
  values: valuesProp,
  onValuesChange: onValuesChangeProp,
  onParsedValuesChange,
  onSubmit: onSubmitProp,
  fieldConfig,
  children,
  className,
  dependencies,
}: {
  formSchema: SchemaType;
  values?: Partial<z.infer<SchemaType>>;
  onValuesChange?: (values: Partial<z.infer<SchemaType>>) => void;
  onParsedValuesChange?: (values: Partial<z.infer<SchemaType>>) => void;
  onSubmit?: (values: z.infer<SchemaType>) => void;
  fieldConfig?: FieldConfig<any>;
  children?: React.ReactNode;
  className?: string;
  dependencies?: Dependency<any>[];
}) {
  const objectFormSchema = getObjectFormSchema(formSchema);
  const defaultValues = getDefaultValues(objectFormSchema) as DefaultValues<
    Record<string, any>
  > | null;

  // Zod v4: z.infer output no longer satisfies Record<string, unknown>,
  // so we cast at the boundaries to keep type-safety at call sites.
  const form = useForm({
    resolver: zodResolver(formSchema as any) as any,
    defaultValues: (defaultValues ?? undefined) as any,
    values: valuesProp as any,
  });

  function onSubmit(values: Record<string, any>) {
    const parsedValues = formSchema.safeParse(values);
    if (parsedValues.success) {
      onSubmitProp?.(parsedValues.data as z.infer<SchemaType>);
    }
  }

  return (
    <div>
      <Form {...(form as any)}>
        <form
          onSubmit={(e) => {
            form.handleSubmit(onSubmit)(e);
            form.reset();
          }}
          onChange={() => {
            const values = form.getValues();
            onValuesChangeProp?.(values as Partial<z.infer<SchemaType>>);
            const parsedValues = formSchema.safeParse(values);
            if (parsedValues.success) {
              onParsedValuesChange?.(
                parsedValues.data as Partial<z.infer<SchemaType>>,
              );
            }
          }}
          className={cn("w-full space-y-5 rounded-md border p-4", className)}
        >
          <AutoFormObject
            schema={objectFormSchema}
            form={form as any}
            dependencies={dependencies as any}
            fieldConfig={fieldConfig as any}
          />

          {children}
        </form>
      </Form>
    </div>
  );
}

export default AutoForm;
