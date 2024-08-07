import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import { beautifyObjectName } from "../utils";
import AutoFormObject from "./object";

export default function AutoFormArray({
  name,
  item,
  form,
  path = [],
  fieldConfig,
}: {
  name: string;
  item: z.ZodArray<any>;
  form: ReturnType<typeof useForm>;
  path?: string[];
  fieldConfig?: any;
}) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name,
  });
  const title = item._def.description ?? beautifyObjectName(name);

  return (
    <AccordionItem value={name} className="border-none">
      <AccordionTrigger>{title}</AccordionTrigger>
      <AccordionContent>
        {fields.map((_field, index) => {
          const key = [...path, index.toString()].join(".");
          return (
            <div className="mt-4 flex flex-col" key={`${key}`}>
              <AutoFormObject
                schema={item._def.type as z.ZodObject<any, any>}
                form={form}
                fieldConfig={fieldConfig}
                path={[...path, index.toString()]}
              />
              <div className="my-4 flex justify-end">
                <Button
                  variant="destructive"
                  size="icon"
                  type="button"
                  onClick={() => remove(index)}
                >
                  <Trash className="size-4 " />
                </Button>
              </div>

              <Separator />
            </div>
          );
        })}
        <Button
          type="button"
          variant="secondary"
          onClick={() => append({})}
          className="mt-4 flex items-center"
        >
          <Plus className="mr-2" size={16} />
          Add
        </Button>
      </AccordionContent>
    </AccordionItem>
  );
}
