"use client";

import AutoForm, { AutoFormSubmit } from "@/components/ui/auto-form";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { RandomButton } from "@/components/ui/randomButton";
import { cn } from "@/lib/utils";
import {
  createCharacter,
  generateCharacter,
  updateCharacter,
} from "@/src/actions/character/character.action";
import {
  Alignments,
  CharacterScenario,
  CharacterSkills,
  Fortunes,
  Strengths,
  Temperments,
  Weaknesses,
} from "@/src/query/character.query";
import {
  GENERATION_RATE_LIMIT,
  MAX_GENERATION_PROMPT_LENGTH,
} from "@/src/actions/character/generation-limits";
import { Weapon } from "@/src/query/weapon.query";
import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { requiredString } from "@/components/form/required-string";
import { z } from "zod";

/**
 * Enum select that must be chosen on create (no empty default) and falls back
 * to the stored value when editing.
 */
function requiredChoice(
  names: [string, ...string[]],
  label: string,
  requiredChoiceMessage: string,
  current?: string,
) {
  const schema = z.enum(names, requiredChoiceMessage).describe(label);
  return current ? schema.default(current) : schema;
}

const FullWidthField = ({ children }: { children: React.ReactNode }) => (
  <div className="md:col-span-2">{children}</div>
);

export const CharacterForm = ({
  temperments,
  strengths,
  weaknesses,
  characterSkills,
  weapons,
  alignements,
  fortunes,
  scenarioId,
  character,
  modify = false,
  autoGeneration,
}: {
  temperments: Temperments;
  strengths: Strengths;
  weaknesses: Weaknesses;
  characterSkills: CharacterSkills;
  weapons: Weapon[];
  alignements: Alignments;
  fortunes: Fortunes;
  scenarioId?: string;
  character?: CharacterScenario;
  modify?: boolean;
  autoGeneration: boolean;
}) => {
  const t = useTranslations("characterForm");
  const tCommon = useTranslations("common");
  const [isLoading, setIsLoading] = useState(false);
  const [values, setValues] =
    useState<Partial<z.infer<typeof characterFormSchema>>>();
  const [message, setMessage] = useState("");
  // Stable component identity: an inline renderParent would remount the
  // input on every keystroke and drop focus.
  const AgeField = useMemo(
    () =>
      function AgeField({ children }: { children: React.ReactNode }) {
        return (
          <div className="flex items-end gap-2 [&>*:first-child]:flex-1">
            {children}
            <RandomButton
              randomize={() =>
                setValues((prev) => ({
                  ...prev,
                  age: Math.floor(Math.random() * 100).toString(),
                }))
              }
            />
          </div>
        );
      },
    [],
  );
  const router = useRouter();

  const tempermentsNames = temperments.map((t) => t.name) as [
    string,
    ...string[],
  ];
  const alignementsNames = alignements.map((a) => a.name) as [
    string,
    ...string[],
  ];
  const fortunesNames = fortunes.map((f) => f.name) as [string, ...string[]];
  const strengthNames = strengths.map((s) => s.name) as [string, ...string[]];
  const weaknessNames = weaknesses.map((w) => w.name) as [string, ...string[]];
  const characterSkillNames = characterSkills.map((c) => c.name) as [
    string,
    ...string[],
  ];
  const weaponNames = weapons.map((w) => w.name) as [string, ...string[]];

  const characterFormSchema = z.object({
    name: requiredString(50, tCommon("requiredField"))
      .describe(t("nameDescribe"))
      .default(character?.name ?? ""),
    pj: z
      .boolean()
      .describe(t("pjDescribe"))
      .default(character?.pj ?? true)
      .optional(),
    origin: z
      .string()
      .max(100)
      .describe(t("originDescribe"))
      .default(character?.origin ?? "")
      .optional(),
    role: z
      .string()
      .max(50)
      .describe(t("roleDescribe"))
      .default(character?.role ?? "")
      .optional(),
    age: z
      .string()
      .min(1)
      .describe(t("ageDescribe"))
      .default(character?.age?.toString() ?? "0")
      .optional(),
    injury: z
      .string()
      .max(100)
      .describe(t("injuryDescribe"))
      .default(character?.injury ?? "")
      .optional(),
    extra: z
      .string()
      .max(200)
      .describe(t("extraDescribe"))
      .default(character?.extra ?? "")
      .optional(),
    temperment: requiredChoice(
      tempermentsNames,
      t("temperment"),
      t("requiredChoiceError"),
      character?.temperment?.name,
    ),
    alignment: requiredChoice(
      alignementsNames,
      t("alignment"),
      t("requiredChoiceError"),
      character?.alignment?.name,
    ),
    fortune: requiredChoice(
      fortunesNames,
      t("fortune"),
      t("requiredChoiceError"),
      character?.fortune?.name,
    ),
    strength: z
      .array(
        z.object({
          name: z
            .enum(strengthNames)
            .describe(t("strengthDescribe"))
            .optional(),
        }),
      )
      .describe(t("strengthSetDescribe")),
    weakness: z
      .array(
        z.object({
          name: z
            .enum(weaknessNames)
            .describe(t("weaknessDescribe"))
            .optional(),
        }),
      )
      .describe(t("weaknessSetDescribe")),
    skillSet: z
      .array(
        z.object({
          name: z
            .enum(characterSkillNames)
            .describe(t("skillDescribe"))
            .optional(),
        }),
      )
      .describe(t("skillSetDescribe")),
    weaponSet: z
      .array(
        z.object({
          name: z.enum(weaponNames).describe(t("weaponDescribe")).optional(),
        }),
      )
      .describe(t("weaponSetDescribe")),
  });

  function getRandomItemsFromArray<T>(
    array: T[],
    maxItems: number,
  ): { name: T }[] {
    // Shuffle the array
    const shuffledArray = array.sort(() => 0.5 - Math.random());
    // Return the first maxItems elements
    return shuffledArray.slice(0, maxItems).map((item) => ({ name: item }));
  }

  return (
    <div className="flex flex-col gap-2">
      {!character && autoGeneration && (
        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger
              disabled={isLoading}
              className={cn(buttonVariants())}
            >
              {isLoading ? (
                <span className="animate-pulse">
                  {t("generatingInProgress")}
                </span>
              ) : (
                <span className="flex">
                  {t("generateWithAi")}{" "}
                  <Sparkles className="ml-2" size={16} />{" "}
                </span>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="flex flex-col gap-2 p-2">
              <Input
                defaultValue={message}
                placeholder={t("generationMessagePlaceholder")}
                className="w-full"
                onBlur={(e) => setMessage(e.target.value)}
                maxLength={MAX_GENERATION_PROMPT_LENGTH}
              />
              <DropdownMenuItem
                className={cn(buttonVariants())}
                disabled={message === ""}
                onClick={async () => {
                  setIsLoading(true);
                  const value = await generateCharacter({ message: message });
                  if (
                    value?.data?.type === "success" &&
                    value?.data.character
                  ) {
                    const generatedCharacter = {
                      ...value?.data.character,
                      age: value?.data.character.age.toString(),
                      temperment:
                        tempermentsNames[
                          Math.floor(
                            Math.random() * (tempermentsNames.length - 1),
                          )
                        ],
                      alignment:
                        alignementsNames[
                          Math.floor(
                            Math.random() * (alignementsNames.length - 1),
                          )
                        ],
                      fortune:
                        fortunesNames[
                          Math.floor(Math.random() * (fortunesNames.length - 1))
                        ],
                      strength: getRandomItemsFromArray(strengthNames, 2),
                      weakness: getRandomItemsFromArray(weaknessNames, 2),
                      skillSet: getRandomItemsFromArray(characterSkillNames, 3),
                      weaponSet: getRandomItemsFromArray(weaponNames, 1),
                    } satisfies Partial<z.infer<typeof characterFormSchema>>;
                    setValues(generatedCharacter);
                    toast.success(t("generatedSuccess"));
                  } else if (value?.data?.type === "rate-limited") {
                    toast.error(
                      t("generationRateLimited", {
                        limit: GENERATION_RATE_LIMIT,
                      }),
                    );
                  } else if (value?.data?.type === "validation-error") {
                    toast.error(t("generationFailed"));
                  } else if (value?.validationErrors) {
                    toast.error(
                      value.validationErrors.message?._errors?.[0] ??
                        t("invalidMessage"),
                    );
                  } else if (value?.serverError) {
                    toast.error(t("generationError"));
                  }
                  setIsLoading(false);
                }}
              >
                {t("generateSubmit")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      <AutoForm
        values={values}
        formSchema={characterFormSchema}
        className="bg-card rounded-xl p-6"
        fieldsClassName="grid gap-x-6 gap-y-5 space-y-0 md:grid-cols-2"
        onValuesChange={setValues}
        onSubmit={async (data) => {
          setIsLoading(true);
          const dataToSend = {
            ...data,
            age: parseInt(data.age ?? "0"),
            strength: data.strength.map((s) => s.name),
            weakness: data.weakness.map((w) => w.name),
            skillSet: data.skillSet.map((s) => s.name),
            weaponSet: data.weaponSet.map(
              (w) => weapons.find((weapon) => weapon.name === w.name)?.id,
            ),
            scenarioId: scenarioId,
          };
          let values = null;
          if (modify) {
            if (character?.id) {
              values = await updateCharacter({
                ...dataToSend,
                id: character.id,
              });
            } else {
              throw new Error("Character id is missing");
            }
          } else {
            values = await createCharacter(dataToSend);
          }
          if (values?.validationErrors || values?.serverError) {
            if (values?.validationErrors) {
              toast.error(tCommon("requiredFieldsError"));
            }
            if (values?.serverError) {
              toast.error(t("authError"));
            }
            setIsLoading(false);
            return values;
          }
          if (modify) {
            toast.success(t("modifiedSuccess"));
            router.push(`/characters`);
          } else {
            toast.success(t("createdSuccess"));
            router.push(
              scenarioId ? `/${scenarioId}/characters` : "/characters",
            );
          }
          return values;
        }}
        fieldConfig={{
          name: {
            renderParent: FullWidthField,
            inputProps: {
              placeholder: t("namePlaceholder"),
            },
          },
          pj: {
            fieldType: "switch",
            renderParent: FullWidthField,
          },
          origin: {
            inputProps: {
              placeholder: t("originPlaceholder"),
            },
          },
          role: {
            inputProps: {
              placeholder: t("rolePlaceholder"),
            },
          },
          age: {
            renderParent: AgeField,
            inputProps: {
              placeholder: t("agePlaceholder"),
            },
          },
          injury: {
            inputProps: {
              placeholder: t("injuryPlaceholder"),
            },
          },
          extra: {
            inputProps: {
              placeholder: t("extraPlaceholder"),
            },
          },
        }}
      >
        <div className="mt-6 flex justify-end border-t pt-6">
          <AutoFormSubmit isLoading={isLoading}>
            {modify ? t("modifySubmit") : t("createSubmit")}
          </AutoFormSubmit>
        </div>
      </AutoForm>
    </div>
  );
};
