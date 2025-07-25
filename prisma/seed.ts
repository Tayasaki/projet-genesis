import { Prisma, PrismaClient } from "../app/generated/prisma";

const prisma = new PrismaClient();

const suggestions: Prisma.SuggestionCreateInput[] = [
  {
    type: "Temperment",
    name: "Agressif",
    description: "Aime le combat et la violence.",
  },
  {
    type: "Temperment",
    name: "Protecteur",
    description: "Protège les plus faibles.",
  },
  {
    type: "Temperment",
    name: "Sanguin",
    description: "Aime le sang.",
  },
  {
    type: "Temperment",
    name: "Amoureux",
    description: "Aime l'amour.",
  },
  {
    type: "Temperment",
    name: "Solitaire",
    description: "Aime la solitude.",
  },
  {
    type: "Alignment",
    name: "Loyal Bon",
    description: "Respecte les règles et fait le bien.",
  },
  {
    type: "Alignment",
    name: "Neutre Bon",
    description: "Fait le bien sans se soucier des règles.",
  },
  {
    type: "Alignment",
    name: "Chaotique Bon",
    description: "Fait le bien en violant les règles.",
  },
  {
    type: "Alignment",
    name: "Loyal Neutre",
    description: "Respecte les règles sans se soucier du bien ou du mal.",
  },
  {
    type: "Alignment",
    name: "Neutre",
    description: "Ne se soucie ni des règles ni du bien ou du mal.",
  },
  {
    type: "Alignment",
    name: "Chaotique Neutre",
    description: "Viole les règles sans se soucier du bien ou du mal.",
  },
  {
    type: "Alignment",
    name: "Loyal Mauvais",
    description: "Respecte les règles et fait le mal.",
  },
  {
    type: "Alignment",
    name: "Neutre Mauvais",
    description: "Fait le mal sans se soucier des règles.",
  },
  {
    type: "Alignment",
    name: "Chaotique Mauvais",
    description: "Fait le mal en violant les règles.",
  },
  {
    type: "Fortune",
    name: "Chanceux",
    description: "A de la chance.",
  },
  {
    type: "Fortune",
    name: "Malchanceux",
    description: "A de la malchance.",
  },
  {
    type: "Strength",
    name: "Force surhumaine",
    description: "Est très fort.",
  },
  {
    type: "Strength",
    name: "Intelligence supérieure",
    description: "Est très intelligent.",
  },
  {
    type: "Weakness",
    name: "Phobie des araignées",
    description: "A peur des araignées.",
  },
  {
    type: "Weakness",
    name: "Allergie aux chats",
    description: "Est allergique aux chats.",
  },
  {
    type: "CharacterSkill",
    name: "Acrobatie",
    description: "Sait faire des acrobaties.",
  },
  {
    type: "CharacterSkill",
    name: "Discrétion",
    description: "Est discret.",
  },
  {
    type: "WeaponSkill",
    name: "Tir de précision",
    description: "Sait tirer avec précision.",
  },
  {
    type: "WeaponSkill",
    name: "Rechargement rapide",
    description: "Sait recharger rapidement.",
  },
  {
    type: "Range",
    name: "Courte",
    description: "Portée courte.",
  },
  {
    type: "Range",
    name: "Moyenne",
    description: "Portée moyenne.",
  },
  {
    type: "Range",
    name: "Longue",
    description: "Portée longue.",
  },
  {
    type: "Damage",
    name: "Faible",
    description: "Dégâts faibles.",
  },
  {
    type: "Damage",
    name: "Moyen",
    description: "Dégâts moyens.",
  },
  {
    type: "Damage",
    name: "Élevé",
    description: "Dégâts élevés.",
  },
  {
    type: "Weight",
    name: "Léger",
    description: "Poids léger.",
  },
  {
    type: "Weight",
    name: "Moyen",
    description: "Poids moyen.",
  },
  {
    type: "Weight",
    name: "Lourd",
    description: "Poids lourd.",
  },
  {
    type: "Ammo",
    name: "Balles",
    description: "Munitions de type balles.",
  },
  {
    type: "Ammo",
    name: "Flèches",
    description: "Munitions de type flèches.",
  },
];

const main = async () => {
  const promises: Prisma.PrismaPromise<unknown>[] = [];

  suggestions.forEach((suggestion) => {
    const promise = prisma.suggestion.create({
      data: suggestion,
    });
    promises.push(promise);
  });

  const superUser: Prisma.UserCreateInput = {
    name: "Giraud",
    email: "theotime.giraud@gmail.com",
    role: "SUPERUSER",
  };

  const userPromise = prisma.user.create({
    data: superUser,
  });
  promises.push(userPromise);

  const weapon: Prisma.WeaponCreateInput = {
    name: "Excalibur",
    description: "Épée légendaire du roi Arthur.",
    melee: true,
    user: {
      connect: {
        email: superUser.email as string,
      },
    },
    damage: {
      create: {
        name: "Épique",
      },
    },
    weight: {
      create: {
        name: "Mythique",
      },
    },
    range: {
      create: {
        name: "Unique",
      },
    },
  };

  const weaponPromise = prisma.weapon.create({
    data: weapon,
  });

  promises.push(weaponPromise);

  await prisma.$transaction(promises);
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
