import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import AutoFormLabel from "../common/label";
import AutoFormTooltip from "../common/tooltip";
import { AutoFormInputComponentProps } from "../types";
import { getEnumOptions } from "../utils";

export default function AutoFormRadioGroup({
  label,
  isRequired,
  field,
  zodItem,
  fieldProps,
  fieldConfigItem,
}: AutoFormInputComponentProps) {
  const values = getEnumOptions(zodItem);

  return (
    <div>
      <FormItem>
        <AutoFormLabel label={label} isRequired={isRequired} />
        <FormControl>
          <RadioGroup
            onValueChange={field.onChange}
            defaultValue={field.value}
            {...fieldProps}
          >
            {values?.map((value: any) => (
              <FormItem
                key={value}
                className="mb-2 flex items-center gap-3 space-y-0"
              >
                <FormControl>
                  <RadioGroupItem value={value} />
                </FormControl>
                <FormLabel className="font-normal">{value}</FormLabel>
              </FormItem>
            ))}
          </RadioGroup>
        </FormControl>
        <FormMessage />
      </FormItem>
      <AutoFormTooltip fieldConfigItem={fieldConfigItem} />
    </div>
  );
}
