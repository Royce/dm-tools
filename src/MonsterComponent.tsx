/** @jsx jsx */
import { jsx, Badge, Box, Flex, Card, Heading } from "theme-ui";
import React, { ReactText } from "react";
import _ from "lodash";
import { MonsterType, UsageType } from "./MonsterType";

const Monster = function Monster(props: MonsterType) {
  return (
    <React.Fragment>
      <Card sx={{ columnCount: [1, 2] }}>
        <Flex>
          <Box sx={{ flex: "1 1 auto" }}>
            <Heading
              as={"h2"}
              sx={{
                fontSize: 4,
                fontVariant: "small-caps",
              }}
            >
              {props.name}
            </Heading>
          </Box>
          <Box>
            <MonsterCR {...props} />
          </Box>
        </Flex>
        <Heading
          as={"h3"}
          sx={{
            fontSize: 1,
            fontStyle: "italic",
          }}
        >
          {props.size} {props.type}
          {!_.isEmpty(props.subtype) && `, ${props.subtype}`}
        </Heading>
        <TaperedRule />
        <Box>
          <b>Armor Class</b>: {props.armor_class}
        </Box>
        <Box>
          <b>Hit Points</b>: {props.hit_points} (
          <Rollable>{hitPointDiceString(props)}</Rollable>)
        </Box>
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
      <pre>{JSON.stringify(props, null, 2)}</pre>
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
            <AbilityScore score={props.strength} />
          </td>
          <td sx={{ textAlign: "center" }}>
            <AbilityScore score={props.dexterity} />
          </td>
          <td sx={{ textAlign: "center" }}>
            <AbilityScore score={props.constitution} />
          </td>
          <td sx={{ textAlign: "center" }}>
            <AbilityScore score={props.intelligence} />
          </td>
          <td sx={{ textAlign: "center" }}>
            <AbilityScore score={props.wisdom} />
          </td>
          <td sx={{ textAlign: "center" }}>
            <AbilityScore score={props.charisma} />
          </td>
        </tr>
      </tbody>
    </table>
  );
};

const MonsterCR = function MonsterCR({ challenge_rating: cr }: MonsterType) {
  return <Badge>CR {cr >= 1 ? cr : `1/${Math.round(1 / cr)}`}</Badge>;
};

const numberToStringWithSign = function numberToStringWithSign(
  n: number
): string {
  return n >= 0 ? `+${n}` : n.toString();
};

const AbilityScore = function AbilityScore({ score }: { score: number }) {
  const modifier = attributeScoreToModifier(score);
  return (
    <span title={score.toString()}>
      {score} (<Rollable>{modifier}</Rollable>)
    </span>
  );
};

const attributeScoreToModifier = function attributeScoreToModifier(
  score: number
) {
  return Math.floor((score - 10) / 2);
};

const hitPointDiceString = function hitPointDiceString(
  monster: MonsterType
): string {
  const constitutionModifier = attributeScoreToModifier(monster.constitution);
  const numberOfHitDice = Number(monster.hit_dice.split("d")[0]);

  return `${monster.hit_dice}+${numberOfHitDice * constitutionModifier}`;
};

const MonsterSpeed = function MonsterSpeed(props: MonsterType) {
  return (
    <Box>
      <b>Speed: </b>
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
      <Heading
        as={"h3"}
        sx={{
          fontSize: 3,
          fontWeight: "normal",
          fontVariant: "small-caps",
          borderBottom: "1px solid darkred",
          marginTop: 2,
        }}
      >
        Legendary Actions
      </Heading>
      <ListOfNameDescriptions list={props.legendary_actions} />
    </Box>
  );
};

const MonsterActions = function MonsterActions(props: MonsterType) {
  if (!props.actions) return null;

  return (
    <React.Fragment>
      <Heading
        as={"h3"}
        sx={{
          fontSize: 3,
          fontWeight: "normal",
          fontVariant: "small-caps",
          borderBottom: "1px solid darkred",
          marginTop: 2,
          breakAfter: "avoid",
        }}
      >
        Actions
      </Heading>
      <ListOfNameDescriptions list={props.actions} />
    </React.Fragment>
  );
};

const MonsterReactions = function MonsterReactions(props: MonsterType) {
  if (!props.reactions) return null;

  return (
    <Box>
      <Heading
        as={"h3"}
        sx={{
          fontSize: 3,
          fontWeight: "normal",
          fontVariant: "small-caps",
          borderBottom: "1px solid darkred",
          marginTop: 2,
        }}
      >
        Reactions
      </Heading>
      <ListOfNameDescriptions list={props.reactions} />
    </Box>
  );
};

const MonsterProficiencies = function MonsterProficiencies(props: MonsterType) {
  if (_.isEmpty(props.proficiencies)) return null;

  return (
    <Box>
      <Heading
        as="h4"
        sx={{
          display: "inline",
          fontSize: 2,
          fontWeight: "bold",
          marginRight: 2,
        }}
      >
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
  if (!props.senses) return null;

  return (
    <Box>
      <Heading
        as="h4"
        sx={{
          display: "inline",
          fontSize: 2,
          fontWeight: "bold",
          marginRight: 2,
        }}
      >
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

const humanize = function humanize(str: string): string {
  return str.replace("_", " ").replace(/^./, str[0].toUpperCase());
};

const MonsterModifiers = function MonsterModifiers(props: {
  heading: string;
  list: string[];
}) {
  if (_.isEmpty(props.list)) return null;

  return (
    <Box>
      <Heading
        as="h4"
        sx={{
          display: "inline",
          fontSize: 2,
          fontWeight: "bold",
          marginRight: 2,
        }}
      >
        {props.heading}
      </Heading>
      <p sx={{ display: "inline" }}>{_.chain(props.list).join(", ").value()}</p>
    </Box>
  );
};

const MonsterAbilities = function MonsterAbilities(props: MonsterType) {
  if (!props.special_abilities) return null;

  return <ListOfNameDescriptions list={props.special_abilities} />;
};

const ListOfNameDescriptions = function ListOfNameDescriptions({
  list,
}: {
  list: { name: string; desc: string; usage?: UsageType }[];
}) {
  return (
    <React.Fragment>
      {_.chain(list)
        .map(({ name, desc, usage }) => (
          <Box>
            <Heading
              as="h4"
              sx={{
                display: "inline",
                fontSize: 2,
                fontWeight: "bold",
                marginRight: 2,
              }}
            >
              {name}
            </Heading>
            <p sx={{ display: "inline" }}>
              <Description desc={desc} />{" "}
              {usage && <em>({usageString(usage)})</em>}
            </p>
          </Box>
        ))
        .value()}
    </React.Fragment>
  );
};

const Description = function (props: { desc: string }) {
  const parts = props.desc.split(/(:|\.\s|\+\d+|\([\d\s\+d]+\))/);
  console.log(parts);
  return (
    <React.Fragment>
      {parts.map((v, index) => {
        if (parts[index + 1] === ":") return <em>{v}</em>;
        if (v.startsWith("+")) return <Rollable>{v}</Rollable>;
        if (v.startsWith("(") && v.endsWith(")"))
          return (
            <React.Fragment>
              (<Rollable>{v.substring(1, v.length - 1)}</Rollable>)
            </React.Fragment>
          );
        return v;
      })}
    </React.Fragment>
  );
};

const Rollable = function Rollable(props: {
  roll?: string | number;
  children: string | number;
}) {
  return (
    <u>
      {typeof props.children === "string"
        ? props.children
        : numberToStringWithSign(props.children)}
    </u>
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

const TaperedRule = function Seperator(props: { avoid?: string }) {
  return (
    <svg
      sx={{
        fill: "#922610",
        stroke: "#922610",
        marginTop: "0.6em",
        marginBottom: "0.35em",
        breakBefore: "avoid",
      }}
      width="100%"
      viewBox="0 0 400 5"
    >
      <polyline points="0,0 400,2.5 0,5" />
    </svg>
  );
};
