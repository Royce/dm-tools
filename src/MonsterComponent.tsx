import React, { useCallback } from "react";
import _ from "lodash";
import {
  Container,
  Card,
  CardBody,
  CardText,
  CardTitle,
  CardSubtitle,
  Table,
} from "reactstrap";
import { MonsterType } from "./MonsterType";

const Monster = function Monster(props: MonsterType) {
  return (
    <>
      <Card>
        <CardBody>
          <CardTitle>
            <b>{props.name}</b> (
            <em>
              {props.size} {props.type}
              {!_.isEmpty(props.subtype) && `, ${props.subtype}`}
            </em>
            ){" - "}
            <MonsterCR {...props} />
          </CardTitle>
          <CardText>
            <b>Armor Class</b>: {props.armor_class}
          </CardText>
          <CardText>
            <b>Hit Points</b>: {props.hit_points} ({hitPointDiceString(props)})
          </CardText>
          <MonsterSpeed {...props} />
          <MonsterStats {...props} />
          <MonsterAbilities {...props} />
          <MonsterActions {...props} />
          <MonsterLegendaryActions {...props} />
        </CardBody>
      </Card>
      <pre>{JSON.stringify(props, null, 2)}</pre>
    </>
  );
};

export default Monster;

const MonsterStats = function MonsterStats(props: MonsterType) {
  return (
    <Table>
      <thead>
        <tr>
          <th>Str</th>
          <th>Dex</th>
          <th>Con</th>
          <th>Int</th>
          <th>Wis</th>
          <th>Cha</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <AbilityScore score={props.strength} />
          </td>
          <td>
            <AbilityScore score={props.dexterity} />
          </td>
          <td>
            <AbilityScore score={props.constitution} />
          </td>
          <td>
            <AbilityScore score={props.intelligence} />
          </td>
          <td>
            <AbilityScore score={props.wisdom} />
          </td>
          <td>
            <AbilityScore score={props.charisma} />
          </td>
        </tr>
      </tbody>
    </Table>
  );
};

const MonsterCR = function MonsterCR({ challenge_rating: cr }: MonsterType) {
  return <span>CR {cr >= 1 ? cr : `1/${Math.round(1 / cr)}`}</span>;
};

const AbilityScore = function AbilityScore({ score }: { score: number }) {
  const modifier = attributeScoreToModifier(score);
  return (
    <span title={score.toString()}>
      {modifier >= 0 ? `+${modifier}` : modifier}
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
    <CardText>
      <b>Speed: </b>
      {_.chain(props.speed)
        .map((value, key) => `${key} ${value}`)
        .join(", ")
        .value()}
    </CardText>
  );
};

const MonsterLegendaryActions = function MonsterLegendaryActions(
  props: MonsterType
) {
  if (!props.legendary_actions) return null;

  return (
    <CardText>
      <b>Legendary Actions:</b>
      <ListOfNameDescriptions list={props.legendary_actions} />
    </CardText>
  );
};
const MonsterActions = function MonsterActions(props: MonsterType) {
  if (!props.actions) return null;

  return (
    <CardText>
      <b>Actions:</b>
      <ListOfNameDescriptions list={props.actions} />
    </CardText>
  );
};

const MonsterAbilities = function MonsterAbilities(props: MonsterType) {
  if (!props.special_abilities) return null;

  return (
    <CardText>
      <b>Special Abilities:</b>
      <ListOfNameDescriptions list={props.special_abilities} />
    </CardText>
  );
};

const ListOfNameDescriptions = function ListOfNameDescriptions({
  list,
}: {
  list: { name: string; desc: string }[];
}) {
  return (
    <ul>
      {_.chain(list)
        .map(({ name, desc }) => (
          <li>
            <b>{name}</b> - {desc}
          </li>
        ))
        .value()}
    </ul>
  );
};
