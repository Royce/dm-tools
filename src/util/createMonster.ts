import _ from "lodash";

import { MonsterType, ActionType, DamageType } from "../MonsterType";

type MonsterTemplate = {
  challenge_rating: number;
  armor_class: number;
  hit_points: number;
  attack_bonus: number;
  damage_quota: number;
  dc_value: number;
  best_roll: number;
};

export const generate = function generate(cr: number): MonsterTemplate {
  const dmg =
    cr === 0
      ? 1
      : cr === 0.125
      ? 3
      : cr === 0.25
      ? 5
      : cr === 0.5
      ? 8
      : cr < 8
      ? cr * 5 + 5
      : cr * 5;

  const att = cr === 0 ? 2 : cr < 0.5 ? 3 : Math.floor(4 + cr / 2);

  return {
    challenge_rating: cr,
    armor_class: cr < 0.25 ? 12 : Math.floor(13 + cr / 3),
    hit_points: dmg * 3,
    attack_bonus: att,
    damage_quota: dmg,
    dc_value: att + 7,
    best_roll: att - 1,
  };
};

export const humanoid = function humanoid(
  name: string,
  cr: number
): MonsterType & MonsterTemplate {
  return {
    ...generate(cr),
    index: name,
    name,
    type: "humanoid",
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    size: "Medium",
    speed: { walk: "30ft." },
    proficiencies: [],
    damage_vulnerabilities: [],
    damage_resistances: [],
    damage_immunities: [],
    condition_immunities: [],
    senses: {},
  };
};

export const sneak = function (
  monster: MonsterType & MonsterTemplate
): MonsterType & MonsterTemplate {
  const dexterity = monster.best_roll;
  const damage_quota = monster.damage_quota * 1.6;
  const sneak_attack_dice = Math.floor(monster.challenge_rating) + 1;

  const x = damage_quota - (sneak_attack_dice * 3.5) / 4;
  const non_sneak_allowance = (x / 5) * 4;

  const stab = dagger(monster.attack_bonus, dexterity);
  const stab_dmg = averageDamageForAction(stab, [stab]);
  const sword = shortSword(monster.attack_bonus, dexterity);
  const sword_dmg = averageDamageForAction(sword, [sword]);

  var actions: ActionType[];
  if (sword_dmg > non_sneak_allowance) {
    actions = [stab];
  } else if (stab_dmg * 2 > non_sneak_allowance) {
    actions = [sword];
  } else if (sword_dmg + stab_dmg > non_sneak_allowance) {
    actions = [multiAttack(monster.name, [stab, stab]), stab];
  } else if (sword_dmg * 2 > non_sneak_allowance) {
    actions = [multiAttack(monster.name, [sword, stab]), sword, stab];
  } else if (sword_dmg * 2 + stab_dmg > non_sneak_allowance) {
    actions = [multiAttack(monster.name, [sword, sword]), sword];
  } else {
    actions = [multiAttack(monster.name, [sword, sword, stab]), sword, stab];
  }

  return {
    ...monster,
    strength: monster.strength - 2,
    dexterity: monster.dexterity + dexterity * 2,
    intelligence: monster.intelligence + 2 * monster.best_roll - 4,
    wisdom: monster.dexterity + 2 * monster.best_roll - 2,
    armor_class: monster.armor_class - 1,
    hit_points: Math.ceil(0.85 * monster.hit_points),
    damage_quota,
    special_abilities: [
      cunningActionAbility,
      sneakAttackAbility(sneak_attack_dice),
    ],
    actions,
    proficiencies: [
      ...monster.proficiencies,
      skills.stealth(monster.best_roll + 3),
      skills.perception(monster.best_roll + 2),
      skills.investigation(monster.best_roll + 2),
    ],
    senses: { passive_perception: 10 + monster.best_roll + 2 },
  };
};

const averageDamageForAction = function (
  action: ActionType,
  otherAttacks: ActionType[]
): number {
  if (action.damage) {
    return averageDamageFromDamageArray(action.damage);
  }
  if (action.options) {
    return _.chain(action.options.from)
      .map((attacks) =>
        _.reduce(
          attacks,
          (total, { name, count }) => {
            const matchingAttacks = otherAttacks.filter(
              ({ name: n }) => n.toLowerCase() === name.toLowerCase()
            );
            if (matchingAttacks.length === 1) {
              return (
                total +
                Number(count) *
                  averageDamageForAction(matchingAttacks[0], otherAttacks)
              );
            }
            return total;
          },
          0
        )
      )
      .sort()
      .takeRight(action.options.choose)
      .reduce((total, n) => total + n, 0)
      .value();
  }
  if (action.attack_options) {
    return _.chain(action.attack_options.from)
      .map((attack) =>
        attack.damage ? averageDamageFromDamageArray(attack.damage) : 0
      )
      .sort()
      .takeRight(action.attack_options.choose)
      .reduce((total, n) => total + n, 0)
      .value();
  }
  return NaN;
};

const averageDamageFromDamageArray = function (damages: DamageType): number {
  return _.reduce(
    damages,
    (total, damage) => {
      if ("damage_dice" in damage) {
        return total + averageDamageFromRollable(damage.damage_dice);
      }
      return _.chain(damage.from)
        .map("damage_dice")
        .map(averageDamageFromRollable)
        .sort()
        .takeRight(damage.choose)
        .reduce((total, n) => total + n, 0)
        .value();
    },
    0
  );
};

const averageDamageFromRollable = function (damage: string): number {
  const parts = damage.split(/(d|\s*\+\s*)/);
  const n = Number(parts[0]);
  const size = Number(parts[2]);
  const bonus = parts[3].includes("+") ? Number(parts[4]) : 0;
  return Math.floor((n * (size + 1)) / 2 + bonus);
};

const multiAttack = function (name: string, actions: ActionType[]): ActionType {
  const groupByName = _.chain(actions)
    .groupBy("name")
    .map<[number, ActionType]>((actions) => [actions.length, actions[0]])
    .value();
  return {
    name: "Multiattack",
    desc: `The ${name} makes ${actions.length} attacks: ${_.chain(groupByName)
      .map(([count, action]) => `${count} ${action.name}`)
      .join(" and ")
      .value()}`,
    options: {
      choose: 1,
      from: [
        _.chain(groupByName)
          .map<{
            name: string;
            count: number;
            type: "melee" | "ranged" | "ability";
          }>(([count, action]) => ({
            name: action.name,
            count,
            type: action.desc.startsWith("Melee")
              ? "melee"
              : action.desc.startsWith("Ranged")
              ? "ranged"
              : "ability",
          }))
          .value(),
      ],
    },
  };
};

const dagger = function (attack_bonus: number, modifier: number): ActionType {
  return {
    name: "Dagger",
    desc: `Melee Weapon Attack: +${attack_bonus} to hit, reach 5 ft., one target. Hit: ${
      2 + modifier
    } (1d4 + ${modifier}) piercing damage.`,
    attack_bonus: attack_bonus,
    damage: [
      {
        damage_type: {
          name: "Piercing",
          url: "/api/damage-types/piercing",
        },
        damage_dice: `1d4+${modifier}`,
      },
    ],
  };
};

const shortSword = function (
  attack_bonus: number,
  modifier: number
): ActionType {
  return {
    name: "Shortsword",
    desc: `Melee Weapon Attack: +${attack_bonus} to hit, reach 5 ft., one target. Hit: ${
      3 + modifier
    } (1d6 + ${modifier}) piercing damage.`,
    attack_bonus: attack_bonus,
    damage: [
      {
        damage_type: {
          name: "Piercing",
          url: "/api/damage-types/piercing",
        },
        damage_dice: `1d6+${modifier}`,
      },
    ],
  };
};

const cunningActionAbility = {
  name: "Cunning Action",
  desc:
    "On each of its turns, the spy can use a bonus action to take the Dash, Disengage, or Hide action.",
};

const sneakAttackAbility = function (n: number) {
  return {
    name: "Sneak Attack (1/Turn)",
    desc: `The spy deals an extra ${Math.floor(
      (n * 7) / 2
    )} (${n}d6) damage when it hits a target with a weapon attack and has advantage on the attack roll, or when the target is within 5 ft. of an ally of the spy that isn't incapacitated and the spy doesn't have disadvantage on the attack roll.`,
  };
};

const skills = {
  deception: (n: number) => ({
    name: "Skill: Deception",
    url: "/api/proficiencies/skill-deception",
    value: n,
  }),
  insight: (n: number) => ({
    name: "Skill: Insight",
    url: "/api/proficiencies/skill-insight",
    value: n,
  }),
  investigation: (n: number) => ({
    name: "Skill: Investigation",
    url: "/api/proficiencies/skill-investigation",
    value: n,
  }),
  perception: (n: number) => ({
    name: "Skill: Perception",
    url: "/api/proficiencies/skill-perception",
    value: n,
  }),
  persuasion: (n: number) => ({
    name: "Skill: Persuasion",
    url: "/api/proficiencies/skill-persuasion",
    value: n,
  }),
  stealth: (n: number) => ({
    name: "Skill: Stealth",
    url: "/api/proficiencies/skill-stealth",
    value: n,
  }),
};
