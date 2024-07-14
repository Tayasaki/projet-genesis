import { FormControl, FormItem, FormMessage } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dices } from "lucide-react";
import * as z from "zod";
import { Button } from "../../button";
import AutoFormLabel from "../common/label";
import AutoFormTooltip from "../common/tooltip";
import { AutoFormInputComponentProps } from "../types";
import { getBaseSchema } from "../utils";
import { RandomButton } from "../../randomButton";

export default function AutoFormEnum({
  label,
  isRequired,
  field,
  fieldConfigItem,
  zodItem,
  fieldProps,
}: AutoFormInputComponentProps) {
  const baseValues = (getBaseSchema(zodItem) as unknown as z.ZodEnum<any>)._def
    .values;

  let values: [string, string][] = [];
  if (!Array.isArray(baseValues)) {
    values = Object.entries(baseValues);
  } else {
    values = baseValues.map((value) => [value, value]);
  }

  function findItem(value: any) {
    return values.find((item) => item[0] === value);
  }

  return values.length === 0 ? (
    <p>Il n&apos;y a pas encore d&apos;élément pour cette catégorie</p>
  ) : (
    <FormItem>
      <AutoFormLabel label={label} isRequired={isRequired} />
      <FormControl>
        <Select
          onValueChange={field.onChange}
          defaultValue={field.value}
          {...fieldProps}
        >
          <SelectTrigger className={fieldProps.className}>
            <SelectValue placeholder={fieldConfigItem.inputProps?.placeholder}>
              {field.value ? findItem(field.value)?.[1] : "Select an option"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {values.map(([value, label]) => (
              <SelectItem value={label} key={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormControl>
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
