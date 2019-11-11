import React, { useCallback, useState, useReducer, useEffect } from "react";
import { produce } from "immer";
import { createSelector } from "reselect";
import _ from "lodash";
import {
  Alert,
  Badge,
  ButtonGroup,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Container,
  Row,
  Col,
  UncontrolledDropdown,
  Button
} from "reactstrap";
import {
  GiWalk as Move,
  GiRun as Dash,
  GiBoltSpellCast as Spell,
  GiSwordWound as Melee,
  GiHighShot as Ranged,
  GiPerspectiveDiceSixFacesRandom as Other,
  GiTrade as Swap
} from "react-icons/gi";
import { FiX as Cancel, FiAlertTriangle as Surprise } from "react-icons/fi";

import { useToggle } from "./hooks/useToggle";
import { rng, Dice } from "./rng";
import { Layout } from "./Layout";
import { InitiativeButton } from "./InitiativeButton";

const Players = ["Orel", "Betty/Rob", "Rinn", "Steve", "Tiro"];
const Monsters = ["Monster 1"];

type Action = "dash" | "other" | "ranged" | "melee" | "spell";
type Category = "surprised" | "swap" | "move" | "action" | "bonus";
type CreatureType = "monster" | "player";
type Creature = { creatureType: CreatureType; creatureName: string };
type Choice = {
  round: number;
  confirmed_at?: number;
  choice: ChoiceTuple;
} & Creature;
type ChoiceTuple =
  | ([("surprised" | "swap" | "move"), boolean])
  | (["bonus" | "action", Action | undefined]);

type State = {
  players: string[];
  monsters: string[];
  round: { number: number; rng: Dice };
  choices: Choice[];
};

const Rinn: Creature = { creatureType: "player", creatureName: "Rinn" };
const Orel: Creature = { creatureType: "player", creatureName: "Orel" };
const initialState: State = {
  players: Players,
  monsters: Monsters,
  round: { number: 1, rng: rng() },
  choices: [
    { round: 1, ...Orel, choice: ["move", true] },
    { round: 1, ...Orel, choice: ["action", "spell"] },
    { round: 1, ...Rinn, choice: ["move", true], confirmed_at: 4 }
  ]
};

const calculateOffset = (dice: Dice, choice: Choice): number => {
  switch (choice.choice[0]) {
    case "surprised":
      return 10;
    case "move":
      return dice.seed(1 * 10).roll(6);
    case "action":
      switch (choice.choice[1]) {
        case "dash":
          return dice.seed(2 * 10).roll(6);
        case "other":
          return dice.seed(4 * 10).roll(6);
        case "ranged":
          return dice.seed(8 * 10).roll(4);
        case "melee":
          return dice.seed(16 * 10).roll(8);
        case "spell":
          return dice.seed(32 * 10).roll(10);
        default:
          return 0;
      }
    case "swap":
      return dice.seed(64 * 10).roll(6);
    case "bonus":
      switch (choice.choice[1]) {
        case "dash":
          return dice.seed(2 * 256 * 10).roll(6);
        case "other":
          return dice.seed(4 * 256 * 10).roll(6);
        case "ranged":
          return dice.seed(8 * 256 * 10).roll(4);
        case "melee":
          return dice.seed(16 * 256 * 10).roll(8);
        case "spell":
          return dice.seed(32 * 256 * 10).roll(10);
        default:
          return 0;
      }

    default:
      return 0;
  }
};

type ChoiceWithOffset = Choice & { offset: number };
const getCurrentRoundChoicesWithOffsets = ({
  round,
  choices,
  players,
  monsters
}: State): ChoiceWithOffset[] => {
  return _.chain(choices)
    .filter({ round: round.number })
    .map(choice => {
      const dice = round.rng.seed(
        choice.creatureType === "player"
          ? players.indexOf(choice.creatureName)
          : monsters.indexOf(choice.creatureName) * -1
      );
      return { offset: calculateOffset(dice, choice), ...choice };
    })
    .value();
};
const getPlayers = ({ players }: State) => players;

const isSwap = (choices: ChoiceWithOffset[]): boolean => {
  for (let index = 0; index < choices.length; index++) {
    const current = choices[index].choice;
    if (current[0] === "swap") return current[1];
  }
  return false;
};
const isSurprised = (choices: ChoiceWithOffset[]): boolean => {
  for (let index = 0; index < choices.length; index++) {
    const current = choices[index].choice;
    if (current[0] === "surprised") return current[1];
  }
  return false;
};
const isMove = (choices: ChoiceWithOffset[]): boolean => {
  for (let index = 0; index < choices.length; index++) {
    const current = choices[index].choice;
    if (current[0] === "move") return current[1];
  }
  return false;
};
const getAction = (choices: ChoiceWithOffset[]): Action | undefined => {
  for (let index = 0; index < choices.length; index++) {
    const current = choices[index].choice;
    if (current[0] === "action") return current[1];
  }
  return undefined;
};
const getBonus = (choices: ChoiceWithOffset[]): Action | undefined => {
  for (let index = 0; index < choices.length; index++) {
    const current = choices[index].choice;
    if (current[0] === "bonus") return current[1];
  }
  return undefined;
};

const choices = createSelector(
  getCurrentRoundChoicesWithOffsets,
  getPlayers,
  (choices: ChoiceWithOffset[], players) => {
    return players.map(playerName => {
      const currentChoices = _.filter(choices, {
        creatureName: playerName
      });
      const initiative = _.reduce(
        currentChoices,
        (prev, { offset }) => prev + offset,
        0
      );
      const creatureType: CreatureType = "player";
      return {
        creatureName: playerName,
        creatureType,
        initiative,
        move: isMove(currentChoices),
        action: getAction(currentChoices),
        bonus: getBonus(currentChoices),
        swap: isSwap(currentChoices),
        surprised: isSurprised(currentChoices)
      };
    });
  }
);

const commited = (state: State) => {
  return _.chain(state.choices)
    .filter(c => c.confirmed_at !== undefined)
    .groupBy(c => c.creatureName)
    .map((choices, creatureName) => {
      return { creatureName, choices: choices.map(({ choice }) => choice) };
    })
    .value();
};

const pendingCommit = createSelector(
  getCurrentRoundChoicesWithOffsets,
  choices => {
    return _.chain(choices)
      .filter(({ confirmed_at }) => confirmed_at === undefined)
      .groupBy("creatureName")
      .map(thisPlayersChoices => ({
        creatureName: thisPlayersChoices[0].creatureName,
        choices: thisPlayersChoices.map(({ choice }) => choice),
        initiative: _.reduce(
          thisPlayersChoices,
          (prev, { offset }) => prev + offset,
          0
        )
      }))
      .filter(
        ({ choices }) =>
          !(choices.length === 1 && choices[0][0] === "surprised")
      )
      .value();
  }
);

const stillSurprised = createSelector(
  getCurrentRoundChoicesWithOffsets,
  choices => {
    return _.chain(choices)
      .filter(({ confirmed_at }) => confirmed_at === undefined)
      .filter(({ choice }) => choice[0] === "surprised")
      .map(({ creatureName, offset }) => ({ creatureName, initiative: offset }))
      .value();
  }
);

const pendingChoice = createSelector(
  getPlayers,
  getCurrentRoundChoicesWithOffsets,
  (players, choices) => {
    const playersWithChoices = _.chain(choices)
      .map("creatureName")
      .uniq()
      .value();

    return _.chain(players)
      .without(...playersWithChoices)
      .map(name => ({ creatureName: name }))
      .value();
  }
);

type DispatchAction =
  | ({
      type: "addChoice";
      creatureName: string;
      choice: ChoiceTuple;
    })
  | { type: "newRound" };
function reducer(state: State, action: DispatchAction) {
  switch (action.type) {
    case "addChoice":
      const next = produce(state, draftState => {
        const existing = _.chain(draftState.choices)
          .filter({
            round: draftState.round.number,
            creatureName: action.creatureName
          })
          .filter(({ choice }) => choice[0] === action.choice[0])
          .first()
          .value();
        if (_.isObject(existing)) {
          if (action.choice[1] === false || action.choice[1] === undefined) {
            draftState.choices.splice(draftState.choices.indexOf(existing), 1);
          } else {
          }
        } else {
          draftState.choices.push({
            round: draftState.round.number,
            creatureName: action.creatureName,
            creatureType: "player",
            choice: action.choice
          });
        }
      });
      console.log(next);
      return next;
    // case "newRound":
    //   return {
    //     ...state,
    //     rng: rng(),
    //     roundNumber: state.roundNumber + 1,
    //     round: [...state.players, ...state.monsters].map((name, index) => ({
    //       creatureKind: state.players.indexOf(name) !== -1 ? PLAYER : MONSTER,
    //       name: name,
    //       enabled: true,
    //       initiative: undefined
    //     }))
    //   };
    default:
      throw new Error();
  }
}

const App = function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const newRound = useCallback(() => dispatch({ type: "newRound" }), []);

  console.log(stillSurprised(state));
  return (
    <Layout>
      <Container>
        <Row>
          <Col xs="3">
            {commited(state).map(ActionBlock)}
            {_.chain([
              ...pendingCommit(state).map(({ initiative, ...props }) => [
                initiative,
                <ActionBlock onClick={() => {}} {...props} />
              ]),
              ...stillSurprised(state).map(({ initiative, ...props }) => [
                initiative,
                <SurprisedBlock onClick={() => {}} {...props} />
              ])
            ])
              .sortBy(([initiative]) => initiative)
              .map(([, element]) => element)
              .value()}
            {pendingChoice(state).length > 0 && (
              <Alert>
                {_.map(pendingChoice(state), "creatureName").join(", ")}
              </Alert>
            )}
          </Col>
          <Col xs="9">
            {_.map(choices(state), creature => {
              return (
                <Row
                  key={`${"temp"} ${creature.creatureName}`}
                  style={{
                    paddingTop: "10px",
                    paddingBottom: "10px",
                    borderColor: "#ccc",
                    borderBottomWidth: "1px",
                    borderBottomStyle: "solid",
                    backgroundColor:
                      creature.creatureType === "player"
                        ? "#f001"
                        : "transparent"
                  }}
                >
                  <InitiativeRow
                    {...creature}
                    set={choice =>
                      dispatch({
                        type: "addChoice",
                        creatureName: creature.creatureName,
                        choice
                      })
                    }
                  />
                </Row>
              );
            })}
            <Row>
              <Col sm={{ size: 3 }}>
                <Button onClick={newRound}>+ Monster</Button>
              </Col>
              <Col sm={{ size: 3 }}>
                <Button onClick={newRound}>Next round</Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};

const ActionBlock = function({
  creatureName,
  choices,
  onClick
}: {
  creatureName: string;
  choices: ChoiceTuple[];
  onClick?: () => void;
}) {
  return (
    <>
      <Alert color={onClick ? "info" : "white"} toggle={onClick}>
        {creatureName}
        {choices.map(([category, choice]) => {
          return (
            <>
              {" "}
              <Badge color={colorForAction(category)}>
                {category === "bonus" && "Bonus: "}
                {category === "move" && choice === true
                  ? "Move"
                  : choice === "dash"
                  ? "Dash"
                  : choice === "spell"
                  ? "Cast a spell"
                  : choice === "ranged"
                  ? "Ranged attack"
                  : choice === "melee"
                  ? "Melee attack"
                  : choice === "other"
                  ? "Alt."
                  : ""}
              </Badge>
            </>
          );
        })}
      </Alert>
    </>
  );
};

const SurprisedBlock = function({
  creatureName: name,
  onClick
}: {
  creatureName: string;
  onClick: () => void;
}) {
  return (
    <>
      <Alert color={onClick ? "warning" : "white"} toggle={onClick}>
        {name} <Badge color={"warning"}>Surprised</Badge>
      </Alert>
    </>
  );
};

function colorForAction(action: Category | Action | undefined) {
  return action === "dash" || action === "move"
    ? "primary"
    : action === "other"
    ? "info"
    : action === "melee" || action === "ranged" || action === "spell"
    ? "danger"
    : "secondary";
}

const InitiativeRow = ({
  creatureName,
  surprised,
  move,
  initiative,
  action,
  swap,
  bonus,
  set
}: {
  creatureName: string;
  surprised: boolean;
  move: boolean;
  swap: boolean;
  initiative: number;
  action: Action | undefined;
  bonus: Action | undefined;
  set: (choice: ChoiceTuple) => void;
}) => {
  return (
    <>
      <Col xs="6" sm="2">
        <b>{initiative === 0 ? "-" : initiative}</b> {creatureName}
      </Col>
      <Col xs="4" sm={{ size: 1, order: 4 }}>
        <InitiativeButton
          on={surprised}
          onClick={() => set(["surprised", !surprised])}
          color={"warning"}
        >
          <Surprise />
        </InitiativeButton>
      </Col>
      <Col xs="9" sm="8">
        <InitiativeButton
          on={move}
          onClick={() => set(["move", !move])}
          color={"primary"}
        >
          <Move />
        </InitiativeButton>{" "}
        <ButtonGroup>
          <InitiativeButton
            on={action === "dash"}
            onClick={() => set(["action", "dash"])}
            color={"primary"}
          >
            <Dash />
          </InitiativeButton>
          <InitiativeButton
            on={action === "other"}
            onClick={() => set(["action", "other"])}
            color={"info"}
          >
            <Other />
          </InitiativeButton>
          <InitiativeButton
            on={action === "ranged"}
            onClick={() => set(["action", "ranged"])}
            color={"danger"}
          >
            <Ranged />
          </InitiativeButton>
          <InitiativeButton
            on={action === "melee"}
            onClick={() => set(["action", "melee"])}
            color={"danger"}
          >
            <Melee />
          </InitiativeButton>
          <InitiativeButton
            on={action === "spell"}
            onClick={() => set(["action", "spell"])}
            color={"danger"}
          >
            <Spell />
          </InitiativeButton>
          <InitiativeButton onClick={() => set(["action", undefined])}>
            <Cancel />
          </InitiativeButton>
        </ButtonGroup>{" "}
        <InitiativeButton
          on={swap}
          onClick={() => set(["swap", !swap])}
          color={"info"}
        >
          <Swap />
        </InitiativeButton>{" "}
        <ButtonGroup>
          <UncontrolledDropdown size="sm">
            <DropdownToggle
              outline={!bonus}
              caret
              color={colorForAction(bonus)}
            >
              {bonus ? `B.A. ${bonus}` : "Bonus Action"}
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem onClick={() => set(["bonus", "dash"])}>
                Dash
              </DropdownItem>
              <DropdownItem onClick={() => set(["bonus", "other"])}>
                Other
              </DropdownItem>
              <DropdownItem onClick={() => set(["bonus", "ranged"])}>
                Ranged
              </DropdownItem>
              <DropdownItem onClick={() => set(["bonus", "melee"])}>
                Melee
              </DropdownItem>
              <DropdownItem onClick={() => set(["bonus", "spell"])}>
                Spell
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
          {bonus && (
            <InitiativeButton onClick={() => set(["bonus", undefined])}>
              <Cancel />
            </InitiativeButton>
          )}
        </ButtonGroup>
      </Col>
    </>
  );
};

export default App;
