/** @jsx jsx */
import { jsx, Badge, Box, Flex, Card, Heading } from "theme-ui";
import React from "react";
import _ from "lodash";
import { MonsterType, UsageType } from "./MonsterType";
import { useSetRecoilState } from "recoil";
import { RollableText } from "./log/RollableText";
import { humanize } from "./util/humanize";
import { numberToStringWithSign } from "./util/numberToStringWithSign";

const Monster = function Monster(props: MonsterType) {
  return (
    <React.Fragment>
      <Card sx={{ columnCount: [1, 2] }}>
        <Flex>
          <Box sx={{ flex: "1 1 auto" }}>
            <Heading as="h2" variant="title">
              {props.name}
            </Heading>
          </Box>
          <Box>
            <MonsterCR {...props} />
          </Box>
        </Flex>
        <Heading as={"h3"} variant="subheading">
          {props.size} {props.type}
          {!_.isEmpty(props.subtype) && `, ${props.subtype}`}
        </Heading>
        <TaperedRule />
        <MonsterArmorClass {...props} />
        <MonsterHitPoints {...props} />
        <MonsterSpeed {...props} />
        <Box sx={{ breakInside: "avoid" }}>
          <TaperedRule />
          <MonsterStats {...props} />
          <TaperedRule />
        </Box>
        <MonsterProficiencies {...props} />
        <MonsterSenses {...props} />
        <MonsterModifiers
          heading="Vulnerable"
          list={props.damage_vulnerabilities}
        />
        <MonsterModifiers
          heading="Resistance"
          list={props.damage_resistances}
        />
        <MonsterModifiers heading="Immunity" list={props.damage_immunities} />
        <MonsterAbilities {...props} />
        <MonsterActions {...props} />
        <MonsterLegendaryActions {...props} />
        <MonsterReactions {...props} />
      </Card>
      {/* <pre>{JSON.stringify(props, null, 2)}</pre> */}
    </React.Fragment>
  );
};

export default Monster;

const MonsterStats = function MonsterStats(props: MonsterType) {
  return (
    <table sx={{ width: "100%" }}>
      <thead>
        <tr>
          <th sx={{ textAlign: "center" }}>Str</th>
          <th sx={{ textAlign: "center" }}>Dex</th>
          <th sx={{ textAlign: "center" }}>Con</th>
          <th sx={{ textAlign: "center" }}>Int</th>
          <th sx={{ textAlign: "center" }}>Wis</th>
          <th sx={{ textAlign: "center" }}>Cha</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td sx={{ textAlign: "center" }}>
            <AbilityScore
              score={props.strength}
              owner={props.name}
              desc={"Strength"}
            />
          </td>
          <td sx={{ textAlign: "center" }}>
            <AbilityScore
              score={props.dexterity}
              owner={props.name}
              desc={"Dexterity"}
            />
          </td>
          <td sx={{ textAlign: "center" }}>
            <AbilityScore
              score={props.constitution}
              owner={props.name}
              desc={"Constitution"}
            />
          </td>
          <td sx={{ textAlign: "center" }}>
            <AbilityScore
              score={props.intelligence}
              owner={props.name}
              desc={"Intelligence"}
            />
          </td>
          <td sx={{ textAlign: "center" }}>
            <AbilityScore
              score={props.wisdom}
              owner={props.name}
              desc={"Wisdom"}
            />
          </td>
          <td sx={{ textAlign: "center" }}>
            <AbilityScore
              score={props.charisma}
              owner={props.name}
              desc={"Charisma"}
            />
          </td>
        </tr>
      </tbody>
    </table>
  );
};

const MonsterCR = function MonsterCR({ challenge_rating: cr }: MonsterType) {
  return <Badge>CR {cr >= 1 ? cr : `1/${Math.round(1 / cr)}`}</Badge>;
};

const MonsterArmorClass = function MonsterArmorClass(props: MonsterType) {
  return (
    <Box>
      <Heading as="h4" variant="inline">
        Armor Class
      </Heading>
      {props.armor_class}
    </Box>
  );
};

const AbilityScore = function AbilityScore(props: {
  score: number;
  owner: string;
  desc: string;
}) {
  const modifier = attributeScoreToModifier(props.score);
  return (
    <React.Fragment>
      {props.score} (<RollableText {...props}>{modifier}</RollableText>)
    </React.Fragment>
  );
};

const attributeScoreToModifier = function attributeScoreToModifier(
  score: number
) {
  return Math.floor((score - 10) / 2);
};

const MonsterHitPoints = function MonsterHitPoints(props: MonsterType) {
  return (
    <Box>
      <Heading as="h4" variant="inline">
        Hit Points
      </Heading>
      {props.hit_points}
      {props.hit_dice && (
        <React.Fragment>
          (
          <RollableText owner={props.name} desc="Hit Points">
            {hitPointDiceString(props.hit_dice, props.constitution)}
          </RollableText>
          )
        </React.Fragment>
      )}
    </Box>
  );
};

const hitPointDiceString = function hitPointDiceString(
  hit_dice: string,
  constitution: number
): string {
  const constitutionModifier = attributeScoreToModifier(constitution);
  const numberOfHitDice = Number(hit_dice.split("d")[0]);

  return `${hit_dice}+${numberOfHitDice * constitutionModifier}`;
};

const MonsterSpeed = function MonsterSpeed(props: MonsterType) {
  return (
    <Box>
      <Heading as="h4" variant="inline">
        Speed
      </Heading>
      {_.chain(props.speed)
        .map((value, key) => `${key} ${value}`)
        .join(", ")
        .value()}
    </Box>
  );
};

const MonsterLegendaryActions = function MonsterLegendaryActions(
  props: MonsterType
) {
  if (!props.legendary_actions) return null;

  return (
    <Box>
      <Heading as={"h3"}>Legendary Actions</Heading>
      <ListOfNameDescriptions
        owner={props.name}
        list={props.legendary_actions}
      />
    </Box>
  );
};

const MonsterActions = function MonsterActions(props: MonsterType) {
  if (!props.actions) return null;

  return (
    <React.Fragment>
      <Heading as={"h3"}>Actions</Heading>
      <ListOfNameDescriptions owner={props.name} list={props.actions} />
    </React.Fragment>
  );
};

const MonsterReactions = function MonsterReactions(props: MonsterType) {
  if (!props.reactions) return null;

  return (
    <Box>
      <Heading as={"h3"}>Reactions</Heading>
      <ListOfNameDescriptions owner={props.name} list={props.reactions} />
    </Box>
  );
};

const MonsterProficiencies = function MonsterProficiencies(props: MonsterType) {
  if (_.isEmpty(props.proficiencies)) return null;

  return (
    <Box>
      <Heading as="h4" variant="inline">
        Proficiencies
      </Heading>
      <p sx={{ display: "inline" }}>
        {_.chain(props.proficiencies)
          .map(({ name, value }) => {
            const displayName = name
              .replace(/Saving Throw: (.*)/i, "$1 save")
              .replace(/Skill: /, "");
            return `${displayName} ${numberToStringWithSign(value)}`;
          })
          .join(", ")
          .value()}
      </p>
    </Box>
  );
};

const MonsterSenses = function MonsterSenses(props: MonsterType) {
  if (_.isEmpty(props.senses)) return null;

  return (
    <Box>
      <Heading as="h4" variant="inline">
        Senses
      </Heading>
      <p sx={{ display: "inline" }}>
        {_.chain(props.senses)
          .map((value, key) => `${humanize(key)} ${value}`)
          .join(", ")
          .value()}
      </p>
    </Box>
  );
};

const MonsterModifiers = function MonsterModifiers(props: {
  heading: string;
  list: string[];
}) {
  if (_.isEmpty(props.list)) return null;

  return (
    <Box>
      <Heading as="h4" variant="inline">
        {props.heading}
      </Heading>
      <p sx={{ display: "inline" }}>{_.chain(props.list).join(", ").value()}</p>
    </Box>
  );
};

const MonsterAbilities = function MonsterAbilities(props: MonsterType) {
  if (!props.special_abilities) return null;

  return (
    <ListOfNameDescriptions owner={props.name} list={props.special_abilities} />
  );
};

const ListOfNameDescriptions = function ListOfNameDescriptions(props: {
  owner: string;
  list: { name: string; desc: string; usage?: UsageType }[];
}) {
  return (
    <React.Fragment>
      {_.chain(props.list)
        .map(({ name, desc, usage }) => {
          const parts = desc.split(/(:|\.\s|\+\d+|\([\d\s\+d]+\))/);
          return (
            <Box>
              <Heading as="h4" variant="inline">
                {name}
              </Heading>
              <p sx={{ display: "inline" }}>
                {parts.map((v, index) => {
                  if (parts[index + 1] === ":") return <em>{v}</em>;
                  if (v.startsWith("+"))
                    return (
                      <RollableText owner={props.owner} desc={`${name}`}>
                        {v}
                      </RollableText>
                    );
                  if (v.startsWith("(") && v.endsWith(")"))
                    return (
                      <React.Fragment>
                        (
                        <RollableText
                          owner={props.owner}
                          desc={`${name} damage`}
                        >
                          {v.substring(1, v.length - 1)}
                        </RollableText>
                        )
                      </React.Fragment>
                    );
                  return v;
                })}
                {usage && <em>({usageString(usage)})</em>}
              </p>
            </Box>
          );
        })
        .value()}
    </React.Fragment>
  );
};

const usageString = function usageString(usage: UsageType) {
  switch (usage.type) {
    case "per day":
      return `${usage.times} ${usage.type}`;
    case "recharge after rest":
      return `recharge after ${_.join(usage.rest_types, " or ")} rest`;
    case "recharge on roll":
      return `recharge on ${usage.min_value}+ on ${usage.dice}`;
  }
};

const TaperedRule = function Seperator() {
  return (
    <svg
      sx={{
        fill: "accent",
        stroke: "accent",
        marginTop: "0.6em",
        marginBottom: "0.35em",
      }}
      width="100%"
      viewBox="0 0 400 5"
    >
      <polyline points="0,0 400,2.5 0,5" />
    </svg>
  );
};
