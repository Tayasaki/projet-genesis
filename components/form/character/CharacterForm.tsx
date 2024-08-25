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
import { Weapon } from "@/src/query/weapon.query";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

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
  const [isLoading, setIsLoading] = useState(false);
  const [values, setValues] =
    useState<Partial<z.infer<typeof characterFormSchema>>>();
  const [message, setMessage] = useState("");
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
    name: z
      .string()
      .max(50)
      .describe("Nom du personnage")
      .default(character?.name ?? ""),
    pj: z
      .boolean()
      .describe("Personnage joueur")
      .default(character?.pj ?? true)
      .optional(),
    origin: z
      .string()
      .max(100)
      .describe("Origine du personnage")
      .default(character?.origin ?? "")
      .optional(),
    role: z
      .string()
      .max(50)
      .describe("Rôle du personnage")
      .default(character?.role ?? "")
      .optional(),
    age: z
      .string()
      .min(1)
      .describe("Age du personnage")
      .default(character?.age?.toString() ?? "0")
      .optional(),
    injury: z
      .string()
      .max(100)
      .describe("Blessure")
      .default(character?.injury ?? "")
      .optional(),
    extra: z
      .string()
      .max(200)
      .describe("Extra")
      .default(character?.extra ?? "")
      .optional(),
    temperment: z
      .enum(tempermentsNames)
      .default(character?.temperment?.name ?? "")
      .describe("Tempérament"),
    alignment: z
      .enum(alignementsNames)
      .describe("Alignement")
      .default(character?.alignment?.name ?? ""),
    fortune: z
      .enum(fortunesNames)
      .describe("Richesse")
      .default(character?.fortune?.name ?? ""),
    strength: z
      .array(
        z.object({ name: z.enum(strengthNames).describe("Force").optional() }),
      )
      .describe("Forces"),
    weakness: z
      .array(
        z.object({
          name: z.enum(weaknessNames).describe("Faiblesse").optional(),
        }),
      )
      .describe("Faiblesses"),
    skillSet: z
      .array(
        z.object({
          name: z.enum(characterSkillNames).describe("Compétence").optional(),
        }),
      )
      .describe("Compétences"),
    weaponSet: z
      .array(
        z.object({ name: z.enum(weaponNames).describe("Arme").optional() }),
      )
      .describe("Armes"),
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
                  Votre personnage est bientôt prêt...
                </span>
              ) : (
                <span className="flex">
                  Générer avec l&apos;IA <Sparkles className="ml-2" size={16} />{" "}
                </span>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="flex flex-col gap-2 p-2">
              <Input
                defaultValue={message}
                placeholder="Message..."
                className="w-full"
                onBlur={(e) => setMessage(e.target.value)}
                max={50}
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
                    toast.success("Personnage généré avec succès ✨");
                  } else if (value?.data?.type === "error") {
                    toast.error("Erreur lors de la génération du personnage");
                  } else if (value?.data?.type === "validation-error") {
                    toast.error("L'IA n'a pas pu générer de personnage");
                  }
                  setIsLoading(false);
                }}
              >
                C&apos;est parti!
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      <AutoForm
        values={values}
        formSchema={characterFormSchema}
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
              toast.error("Veuillez remplir tous les champs");
            }
            if (values?.serverError) {
              toast.error("Vous devez être connecté pour créer un personnage");
            }
            setIsLoading(false);
            return;
          }
          if (modify) {
            toast.success("Personnage modifié");
            router.push(`/characters`);
          } else {
            toast.success("Personnage créé avec succès");
            router.push(`/${scenarioId}/characters`);
          }
        }}
        fieldConfig={{
          name: {
            inputProps: {
              placeholder: "Eric Tournlavis",
            },
          },
          pj: {
            fieldType: "switch",
          },
          origin: {
            inputProps: {
              placeholder: "Né dans les montagnes",
            },
          },
          role: {
            inputProps: {
              placeholder: "Guerrier",
            },
          },
          age: {
            renderParent: ({ children }) => (
              <div className="space-y-2">
                {children}
                <RandomButton
                  randomize={() => {
                    setValues({
                      ...values,
                      age: Math.floor(Math.random() * 100).toString(),
                    });
                  }}
                />
              </div>
            ),
            inputProps: {
              placeholder: "25",
            },
          },
          injury: {
            inputProps: {
              placeholder: "Blessure à la jambe",
            },
          },
          extra: {
            inputProps: {
              placeholder: "Aime les chats",
            },
          },
        }}
      >
        <AutoFormSubmit isLoading={isLoading}>
          {modify ? "Modifier votre personnage" : "Créer votre personnage"}
        </AutoFormSubmit>
      </AutoForm>
    </div>
  );
};
