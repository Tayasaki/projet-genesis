import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const getAmmos = () => prisma.ammo.findMany();
export const getWeights = () => prisma.weight.findMany();
export const getDamages = () => prisma.damage.findMany();
export const getRanges = () => prisma.range.findMany();
export const getWeaponSkill = () => prisma.weaponSkill.findMany();

export type Ammos = Prisma.PromiseReturnType<typeof getAmmos>;
export type Weights = Prisma.PromiseReturnType<typeof getWeights>;
export type Damages = Prisma.PromiseReturnType<typeof getDamages>;
export type Ranges = Prisma.PromiseReturnType<typeof getRanges>;
export type WeaponSkill = Prisma.PromiseReturnType<typeof getWeaponSkill>;
