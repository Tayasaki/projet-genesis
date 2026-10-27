import { FormItem, FormMessage, useFormField } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";
import AutoFormLabel from "../common/label";
import AutoFormTooltip from "../common/tooltip";
import { AutoFormInputComponentProps } from "../types";
import { getEnumOptions } from "../utils";
import { RandomButton } from "../../randomButton";

const DEFAULT_ENUM_PLACEHOLDER = "Sélectionner une option";

// Rendered inside FormItem so useFormField can read its generated ids. The
// Radix Select root renders no DOM node, so the id, ARIA wiring and ref that a
// FormControl Slot would add belong on the trigger instead.
function EnumTrigger({
  className,
  triggerRef,
  children,
}: {
  className?: string;
  triggerRef?: React.Ref<HTMLButtonElement>;
  children: React.ReactNode;
}) {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <SelectTrigger
      ref={triggerRef}
      id={formItemId}
      aria-invalid={!!error}
      aria-describedby={
        error ? `${formDescriptionId} ${formMessageId}` : formDescriptionId
      }
      className={className}
    >
      {children}
    </SelectTrigger>
  );
}

export default function AutoFormEnum({
  label,
  isRequired,
  field,
  fieldConfigItem,
  zodItem,
  fieldProps,
}: AutoFormInputComponentProps) {
  const { ref, ...rootProps } = fieldProps;
  const values: [string, string][] = getEnumOptions(zodItem).map((value) => [
    value,
    value,
  ]);

  function findItem(value: any) {
    return values.find((item) => item[0] === value);
  }

  return values.length === 0 ? (
    <p>Il n&apos;y a pas encore d&apos;élément pour cette catégorie</p>
  ) : (
    <FormItem>
      <AutoFormLabel label={label} isRequired={isRequired} />
      <Select
        onValueChange={field.onChange}
        defaultValue={field.value}
        {...rootProps}
      >
        <EnumTrigger className={fieldProps.className} triggerRef={ref}>
          <SelectValue
            placeholder={
              fieldConfigItem.inputProps?.placeholder ??
              DEFAULT_ENUM_PLACEHOLDER
            }
          >
            {field.value ? findItem(field.value)?.[1] : undefined}
          </SelectValue>
        </EnumTrigger>
        <SelectContent>
          {values.map(([value, label]) => (
            <SelectItem value={label} key={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <AutoFormTooltip fieldConfigItem={fieldConfigItem} />
      <FormMessage />
      <RandomButton
        randomize={() => {
          field.onChange(values[Math.floor(Math.random() * values.length)][0]);
        }}
      />
    </FormItem>
  );
}
