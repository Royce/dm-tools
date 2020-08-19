// import axios from "axios";
import * as t from "io-ts";
// import * as f from "fp-ts";
// import { PathReporter } from "io-ts/lib/PathReporter";
// import { excess } from "./util/excess";

export type MonsterType = t.TypeOf<typeof MonsterCodec>;
const ReferencedTermCodec = t.type({ name: t.string, url: t.string });
const ProficiencyCodec = t.type({
  name: t.string,
  url: t.string,
  value: t.number,
});
const NameDescCodec = t.type({ name: t.string, desc: t.string });
const DifficultyClassCodec = t.type({
  dc_type: ReferencedTermCodec,
  dc_value: t.number,
  success_type: t.union([t.literal("half"), t.literal("none")]),
});
const DamageCodec = t.type({
  damage_type: ReferencedTermCodec,
  damage_dice: t.string,
});
const DamageArrayCodec = t.array(
  t.union([
    DamageCodec,
    t.type({
      choose: t.number,
      type: t.literal("damage"),
      from: t.array(DamageCodec),
    }),
  ])
);
const UsageCodec = t.union([
  t.type({ type: t.literal("per day"), times: t.number }),
  t.type({
    type: t.literal("recharge on roll"),
    dice: t.string,
    min_value: t.number,
  }),
  t.type({
    type: t.literal("recharge after rest"),
    rest_types: t.array(t.union([t.literal("short"), t.literal("long")])),
  }),
]);
const ActionPartialsCodec = t.partial({
  attack_bonus: t.number,
  damage: DamageArrayCodec,
  usage: UsageCodec,
  options: t.type({
    choose: t.number,
    from: t.array(
      t.array(
        t.intersection([
          t.type({
            name: t.string,
            count: t.union([t.number, t.string]),
            type: t.union([
              t.literal("melee"),
              t.literal("ability"),
              t.literal("ranged"),
              t.literal("magic"),
            ]),
          }),
          t.partial({ note: t.string }),
        ])
      )
    ),
  }),
  attack_options: t.type({
    choose: t.number,
    type: t.literal("attack"),
    from: t.array(
      t.intersection([
        t.type({ name: t.string }),
        t.partial({ dc: DifficultyClassCodec, damage: DamageArrayCodec }),
      ])
    ),
  }),
  dc: DifficultyClassCodec,
});
const ActionsCodec = t.array(
  t.intersection([NameDescCodec, ActionPartialsCodec])
);
const SizesCodec = t.union([
  t.literal("Tiny"),
  t.literal("Small"),
  t.literal("Medium"),
  t.literal("Large"),
  t.literal("Huge"),
  t.literal("Gargantuan"),
]);
const SpecialAbilitiesArrayCodec = t.array(
  t.intersection([NameDescCodec, t.partial({ usage: UsageCodec })])
);
export const MonsterCodec = t.intersection([
  t.type({
    index: t.string,
    name: t.string,
    size: SizesCodec,
    type: t.string,
    subtype: t.union([t.string, t.null]),
    alignment: t.string,
    armor_class: t.number,
    hit_points: t.number,
    hit_dice: t.string,
    speed: t.record(t.string, t.union([t.string, t.literal(true)])),
    constitution: t.number,
    strength: t.number,
    dexterity: t.number,
    intelligence: t.number,
    charisma: t.number,
    wisdom: t.number,
    proficiencies: t.array(ProficiencyCodec),
    damage_vulnerabilities: t.array(t.string),
    damage_resistances: t.array(t.string),
    damage_immunities: t.array(t.string),
    condition_immunities: t.array(ReferencedTermCodec),
    senses: t.record(t.string, t.union([t.string, t.number])),
    languages: t.string,
    challenge_rating: t.number,
    url: t.string,
  }),
  t.partial({
    actions: ActionsCodec,
    legendary_actions: ActionsCodec,
    special_abilities: SpecialAbilitiesArrayCodec,
    note: t.string,
  }),
]);

export type MonsterIndexType = t.TypeOf<typeof IndexCodec>;
const IndexCodec = t.array(t.string);

// axios
//   .get("/srd/monster/index.json")
//   .then((response) => {
//     const validationResult = IndexCodec.decode(response.data);
//     console.log("Validating index", PathReporter.report(validationResult));
//     if (f.either.isRight(validationResult)) {
//       const index: MonsterIndexType = validationResult.right;

//       // const i = Math.floor(Math.random() * index.length);
//       // const i = 60;
//       for (let i = 0; i < index.length; i++) {
//         console.log("Fetching...", i, index[i]);

//         axios.get(`srd/monster/${index[i]}.json`).then((r) => {
//           const vr = MonsterCodec.decode(r.data);
//           console.log(`Validating ${index[i]}`, PathReporter.report(vr));
//         });
//       }
//     }
//   })
//   .catch((reason) => {
//     console.log(reason);
//   });
