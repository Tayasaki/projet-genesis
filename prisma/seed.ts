import { fakerFR as faker } from "@faker-js/faker";
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Scenario = {
  id: string;
  name: string;
  universe: string;
  description?: string | null;
  userId: string;
};

const main = async () => {
  const users = await prisma.user.findMany();
  const characters = [];
  const scenarios: Scenario[] = [];

  for (let i = 0; i < 10; i++) {
    const scenario = {
      name: faker.lorem.words(3),
      universe: faker.location.city(),
      description: faker.lorem.paragraph(),
      userId: users[faker.number.int({ min: 0, max: users.length - 1 })].id,
    } satisfies Prisma.ScenarioUncheckedCreateInput;
    const dbScenario = (await prisma.scenario.create({
      data: scenario,
    })) as Scenario;
    scenarios.push(dbScenario);
  }

  for (let i = 0; i < 10; i++) {
    const character = {
      name: faker.person.fullName(),
      age: faker.number.int({ min: 18, max: 99 }),
      pj: faker.datatype.boolean(),
    } satisfies Prisma.CharacterCreateInput;
    const dbCharacter = await prisma.character.create({ data: character });
    characters.push(dbCharacter);
  }

  for (let i = 0; i < 10; i++) {
    const character = characters[i];
    const scenario =
      scenarios[faker.number.int({ min: 0, max: scenarios.length - 1 })];
    await prisma.scenario.update({
      where: { id: scenario.id },
      data: {
        character: {
          connect: {
            id: character.id,
          },
        },
      },
    });
  }
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
