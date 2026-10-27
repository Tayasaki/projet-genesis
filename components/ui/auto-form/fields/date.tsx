import { DatePicker } from "@/components/ui/date-picker";
import { FormControl, FormItem, FormMessage } from "@/components/ui/form";
import AutoFormLabel from "../common/label";
import AutoFormTooltip from "../common/tooltip";
import { AutoFormInputComponentProps } from "../types";

export default function AutoFormDate({
  label,
  isRequired,
  field,
  fieldConfigItem,
  fieldProps,
}: AutoFormInputComponentProps) {
  // DatePicker forwards its ref to the popover content, not a focusable input.
  const { ref: _ref, ...pickerProps } = fieldProps;
  return (
    <FormItem>
      <AutoFormLabel label={label} isRequired={isRequired} />
      <FormControl>
        <DatePicker
          date={field.value}
          setDate={field.onChange}
          {...pickerProps}
        />
      </FormControl>
      <AutoFormTooltip fieldConfigItem={fieldConfigItem} />

      <FormMessage />
    </FormItem>
  );
}
