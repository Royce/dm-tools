import React, { useCallback } from "react";
import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
  useRecoilCallback,
  atomFamily,
  selectorFamily,
  SetterOrUpdater,
  DefaultValue,
} from "recoil";
import _ from "lodash";
import {
  Button,
  Badge,
  Close,
  Alert,
  Heading,
  Box,
  Grid,
  Flex,
} from "theme-ui";
import {
  GiWalk as Move,
  GiRun as Dash,
  GiBoltSpellCast as Spell,
  GiSwordWound as Melee,
  GiHighShot as Ranged,
  GiPerspectiveDiceSixFacesRandom as Other,
  GiTrade as Swap,
} from "react-icons/gi";
import { FiAlertTriangle as Surprise } from "react-icons/fi";
// import { BsCheck as Confirm } from "react-icons/bs";

import { rng, Dice } from "./util/rng";
import { hashString } from "./util/hash";
import { Confirm } from "./ButtonConfirm";
import { ToggleButton } from "./ToggleButton";

//
// Data
//

const getId = (function getIdClosure() {
  var id = 0;
  return function getId() {
    return id++;
  };
})();

type Round = number;
const currentRoundState = atom<Round>({
  key: "currentRoundState", // unique ID (with respect to other atoms/selectors)
  default: 0, // default value (aka initial value)
});

const diceForRound = atomFamily<Dice, Round>({
  key: "diceForRound",
  default: () => rng(),
});

type CreatureId = number;
const creatureListState = atom<CreatureId[]>({
  key: "creatureListState", // unique ID (with respect to other atoms/selectors)
  default: [], // default value (aka initial value)
});

type CreatureType = "player" | "monster";
type Creature = { name: string; type: CreatureType };
const creatureForId = atomFamily<Creature, CreatureId>({
  key: "creatureForId",
  default: (id) => ({ id, name: "Unknown", type: "player" }),
});

type Condition = "surprised" | "concentrating";
const conditionsForCreature = atomFamily<Condition[], CreatureId>({
  key: "conditionsForCreature",
  default: [],
});
const creatureHasCondition = selectorFamily<boolean, [CreatureId, Condition]>({
  key: "creatureHasCondition",
  get: ([id, condition]) => ({ get }) => {
    const conditions = get(conditionsForCreature(id));
    return conditions.includes(condition);
  },
  set: ([id, condition]) => ({ set }, newValue) => {
    set(conditionsForCreature(id), (conditions) =>
      newValue === false
        ? _.without(conditions, condition)
        : _.union(conditions, [condition])
    );
  },
});

type ChoiceCategory = "move" | "action" | "bonus" | "swap";
type ChoiceValue =
  | "move"
  | "melee"
  | "spell"
  | "ranged"
  | "other"
  | "swap"
  | undefined;
type Choice = {
  category: ChoiceCategory;
  choice: ChoiceValue;
  confirmed_at?: number;
  creature: CreatureId;
};
interface ChoiceMap {
  [index: string]: Choice;
}
const choicesForRoundMap = atomFamily<ChoiceMap, Round>({
  key: "choiceForRoundMap",
  default: (round) => ({}),
});
type CreatureRoundCategory = [CreatureId, number, ChoiceCategory];
const choiceFor = selectorFamily<ChoiceValue, CreatureRoundCategory>({
  key: "choiceForIdRoundCategory",
  get: ([id, round, category]) => ({ get }) => {
    const key = `${id}_${category}`;
    const map = get(choicesForRoundMap(round));
    const match = map[key];
    return (match || {}).choice;
  },
  set: ([id, round, category]) => ({ set, get }, newValue) => {
    const key = `${id}_${category}`;
    set<ChoiceMap>(choicesForRoundMap(round), (map) => {
      return {
        ...map,
        [key]: {
          category,
          creature: id,
          choice: newValue instanceof DefaultValue ? undefined : newValue,
        },
      };
    });
  },
});

const choiceConfirmedFor = selectorFamily<boolean, CreatureRoundCategory>({
  key: "choiceForIdRoundCategory",
  get: ([id, round, category]) => ({ get }) => {
    const key = `${id}_${category}`;
    const map = get(choicesForRoundMap(round));
    const match = map[key];
    return !!(match || {}).confirmed_at;
  },
});

const choicesForRound = selectorFamily<Choice[], Round>({
  key: "choiceForRound",
  get: (round) => ({ get }) => {
    const map = get(choicesForRoundMap(round));
    return Object.values(map);
  },
});

type Initiative = number;
type ChoiceAndInitiative = [Choice, Initiative];
type CreatureInitiativeChoices = {
  creature: CreatureId;
  initiative: Initiative;
  choices: [Choice, Initiative][];
};
const unconfirmedChoices = selectorFamily<CreatureInitiativeChoices[], Round>({
  key: "unconfirmedChoices",
  get: (round) => ({ get }) => {
    const dice = get(diceForRound(round));
    const list = get(choicesForRound(round)).filter(
      ({ choice, confirmed_at }) =>
        choice !== undefined && confirmed_at === undefined
    );
    const byCreature = _.groupBy(list, "creature");

    const withInitiative = _.map<
      _.Dictionary<Choice[]>,
      CreatureInitiativeChoices
    >(byCreature, (choices) => {
      const choicesWithInitiative = choices.map<ChoiceAndInitiative>(
        (choice) => [
          choice,
          dice.seed(calculateSeed(choice)).roll(diceSize(choice.choice)),
        ]
      );

      const surprised = get(
        creatureHasCondition([choices[0].creature, "surprised"])
      );
      return {
        creature: choices[0].creature,
        initiative: choicesWithInitiative.reduce(
          (tally, [, init]) => tally + init,
          surprised ? 10 : 0
        ),
        choices: choicesWithInitiative,
      };
    });
    return withInitiative;
  },
});

type CreatureConfirmedChoices = {
  creature: CreatureId;
  confirmed_at: Initiative;
  choices: Choice[];
};
const confirmedChoices = selectorFamily<CreatureConfirmedChoices[], Round>({
  key: "confirmedChoices",
  get: (round) => ({ get }) => {
    const list = get(choicesForRound(round)).filter(
      ({ choice, confirmed_at }) =>
        choice !== undefined && confirmed_at !== undefined
    );

    return _.map<_.Dictionary<Choice[]>, CreatureConfirmedChoices>(
      _.groupBy(list, "creature"),
      (choices) => ({
        creature: choices[0].creature,
        confirmed_at: choices[0].confirmed_at || NaN,
        choices,
      })
    );
  },
});

const noChoices = selectorFamily<CreatureId[], Round>({
  key: "noChoices",
  get: (round) => ({ get }) => {
    const creatures = get(creatureListState);
    const creaturesWithChoices = _.chain(get(choicesForRound(round)))
      .filter(({ choice }) => choice !== undefined)
      .map("creature")
      .uniq()
      .value();

    return _.without(creatures, ...creaturesWithChoices).filter((id) => {
      return (
        get(creatureForId(id)).type === "player" ||
        get(creatureHasCondition([id, "surprised"]))
      );
    });
  },
});

//
// Util.
//

const describeChoice = function describeChoice({ category, choice }: Choice) {
  switch (choice) {
    case "melee":
    case "ranged":
    case "spell":
      return choice;
    // return `${choice} attack`;
    case "move":
      return category === "move" ? "move" : "dash";
    case "other":
      return `other`;
    case "swap":
      return `swap equipment`;
    default:
      break;
  }
  return "???";
};

const calculateSeed = function calculateSeed({
  creature,
  category,
  choice,
}: Choice) {
  return hashString(creature + category + choice);
};

const diceSize = function diceSize(choice: ChoiceValue) {
  switch (choice) {
    case "ranged":
      return 4;
    case "move":
    case "other":
    case "swap":
    default:
      return 6;
    case "melee":
      return 8;
    case "spell":
      return 10;
  }
};

const choiceSortPartial = function choiceSortPartial(c1: Choice, c2: Choice) {
  const order = { move: 0, swap: 4, action: 6, bonus: 8 };
  if (c1.category === c2.category) return 0;
  return order[c1.category] > order[c2.category] ? 1 : -1;
};

//
// UI
//

const RoundNumberHeading = function RoundNumberHeading() {
  const roundNumber = useRecoilValue(currentRoundState);
  return <>Round {roundNumber}</>;
};

const NewRoundNumberButton = function NewRoundNumberButton() {
  const [roundNumber, setRoundNumber] = useRecoilState(currentRoundState);
  const clearConditionForAll = useRecoilCallback(
    ({ set, snapshot }) => async (condition: Condition) => {
      const ids = await snapshot.getPromise(creatureListState);
      for (let index = 0; index < ids.length; index++) {
        set(creatureHasCondition([ids[index], condition]), false);
      }
    },
    []
  );

  const incrementRound = useCallback(() => {
    setRoundNumber((n) => n + 1);
    if (roundNumber === 1) clearConditionForAll("surprised");
  }, [roundNumber, setRoundNumber, clearConditionForAll]);

  return (
    <Button variant="secondary" onClick={incrementRound} sx={{ fontSize: 1 }}>
      Next Round
    </Button>
  );
};

const CreatureItem = function CreatureItem({ id }: { id: CreatureId }) {
  const { name } = useRecoilValue(creatureForId(id));
  return <li>{name}</li>;
};

const CreatureList = function CreatureList() {
  const list = useRecoilValue(creatureListState);
  return (
    <ul>
      {list.map((id) => (
        <CreatureItem key={id} id={id} />
      ))}
    </ul>
  );
};

const AddCreatureButton = function SeedEncounterButton() {
  const addCreature = useRecoilCallback(
    ({ set }) => async () => {
      const id: CreatureId = getId();

      set<Creature>(creatureForId(id), {
        name: ["Jen", "Snake", "Grog", "Goblin"][id % 4],
        type: id % 2 ? "player" : "monster",
      });
      set(creatureListState, (ids) => [...ids, id]);
    },
    []
  );

  return (
    <Button variant="secondary" onClick={addCreature}>
      Add Creature
    </Button>
  );
};

type CreatureAndRound = {
  id: CreatureId;
  round: number;
};
const BinaryChoiceBase = function BinaryChoiceBase({
  id,
  round,
  category,
}: CreatureAndRound & { category: "move" | "swap" }) {
  const args: CreatureRoundCategory = [id, round, category];
  const [choice, setChoice] = useRecoilState(choiceFor(args));
  const confirmed = useRecoilValue(choiceConfirmedFor(args));

  return (
    <ToggleButton
      disabled={confirmed}
      on={category === choice}
      onClick={() => setChoice(category === choice ? undefined : category)}
      color={category}
    >
      {category === "move" ? <Move /> : category === "swap" ? <Swap /> : null}
    </ToggleButton>
  );
};

const MoveChoice = function MoveChoice(props: CreatureAndRound) {
  return <BinaryChoiceBase {...props} category={"move"} />;
};

const SwapChoice = function MoveChoice(props: CreatureAndRound) {
  return <BinaryChoiceBase {...props} category={"swap"} />;
};

const SurprisedChoice = function SurprisedChoice({ id }: { id: CreatureId }) {
  const [surprised, setSurprised] = useRecoilState(
    creatureHasCondition([id, "surprised"])
  );

  return (
    <ToggleButton
      disabled={false}
      on={surprised}
      onClick={() => setSurprised(!surprised)}
      color={"surprised"}
    >
      {"surprised" === "surprised" ? <Surprise /> : null}
    </ToggleButton>
  );
};

const ActionChoiceBase = function ActionChoiceBase({
  value,
  choice,
  disabled,
  setChoice,
}: {
  value: ChoiceValue | undefined;
  choice: ChoiceValue;
  disabled: boolean;
  setChoice: SetterOrUpdater<ChoiceValue>;
}) {
  return (
    <ToggleButton
      disabled={disabled}
      on={choice === value}
      onClick={() => setChoice(choice === value ? undefined : value)}
      color={value}
    >
      {value === "move" ? (
        <Dash />
      ) : value === "spell" ? (
        <Spell />
      ) : value === "melee" ? (
        <Melee />
      ) : value === "ranged" ? (
        <Ranged />
      ) : value === "other" ? (
        <Other />
      ) : null}
    </ToggleButton>
  );
};

const ActionChoice = function ActionChoice(
  props: CreatureAndRound & { value: ChoiceValue | undefined }
) {
  const args: CreatureRoundCategory = [props.id, props.round, "action"];
  const [choice, setChoice] = useRecoilState(choiceFor(args));
  const confirmed = useRecoilValue(choiceConfirmedFor(args));
  return (
    <ActionChoiceBase
      {...props}
      choice={choice}
      setChoice={setChoice}
      disabled={confirmed}
    />
  );
};

const BonusActionChoice = function ActionChoice(
  props: CreatureAndRound & { value: ChoiceValue | undefined }
) {
  const args: CreatureRoundCategory = [props.id, props.round, "bonus"];
  const [choice, setChoice] = useRecoilState(choiceFor(args));
  const confirmed = useRecoilValue(choiceConfirmedFor(args));
  return (
    <ActionChoiceBase
      {...props}
      choice={choice}
      setChoice={setChoice}
      disabled={confirmed}
    />
  );
};

const ChoicesItem = function Choices({ id }: { id: CreatureId }) {
  const creature = useRecoilValue(creatureForId(id));
  const round = useRecoilValue(currentRoundState);
  return (
    <Grid gap={1} columns={[1, "1fr 420px"]} pb={3}>
      <Box sx={{ alignSelf: "flex-end" }}>
        <Heading
          as="h2"
          variant={"heading"}
          sx={{
            alignSelf: "baseline",
            borderBottomColor: creature.type === "player" ? "primary" : null,
          }}
        >
          {creature.name}
        </Heading>
      </Box>
      <Flex sx={{ justifyContent: "space-between" }}>
        <Box>
          <MoveChoice id={id} round={round} />
        </Box>
        {/* <SwapChoice id={id} round={round} /> */}
        <Box>
          <ActionChoice id={id} round={round} value={"move"} />
          <ActionChoice id={id} round={round} value={"melee"} />
          <ActionChoice id={id} round={round} value={"ranged"} />
          <ActionChoice id={id} round={round} value={"spell"} />
          <ActionChoice id={id} round={round} value={"other"} />
        </Box>
        <Box>
          <BonusActionChoice id={id} round={round} value={"move"} />
          <BonusActionChoice id={id} round={round} value={"melee"} />
          <BonusActionChoice id={id} round={round} value={"ranged"} />
          <BonusActionChoice id={id} round={round} value={"spell"} />
          <BonusActionChoice id={id} round={round} value={"other"} />
        </Box>
        {round === 1 && (
          <Box>
            <SurprisedChoice id={id} />
          </Box>
        )}
      </Flex>
    </Grid>
  );
};

const Choices = function Choices() {
  const list = useRecoilValue(creatureListState);
  if (list.length === 0) {
    return null;
  }
  return (
    <>
      {list.map((id) => (
        <ChoicesItem key={id} id={id} />
      ))}
    </>
  );
};

const UnconfirmedChoices = function UnconfirmedChoices() {
  const currentRound = useRecoilValue(currentRoundState);
  const unconfirmed = useRecoilValue(unconfirmedChoices(currentRound));

  return (
    <>
      {unconfirmed
        .slice()
        .sort(({ initiative: a }, { initiative: b }) => a - b)
        .map((props) => (
          <ActionsSummary
            key={props.creature}
            {...props}
            choices={props.choices.map(([choice]) => choice)}
            currentRound={currentRound}
            confirmed={false}
          />
        ))}
    </>
  );
};

const ConfirmedChoices = function UnconfirmedChoices() {
  const currentRound = useRecoilValue(currentRoundState);
  const confirmed = useRecoilValue(confirmedChoices(currentRound));

  return (
    <>
      {confirmed
        .slice()
        .sort(({ confirmed_at: a }, { confirmed_at: b }) => a - b)
        .map(({ creature, confirmed_at, choices }) => (
          <ActionsSummary
            key={creature}
            creature={creature}
            initiative={confirmed_at}
            choices={choices}
            currentRound={currentRound}
            confirmed={true}
          />
        ))}
    </>
  );
};

const ActionsSummary = function ActionsSummary({
  initiative: total,
  creature,
  currentRound,
  choices,
  confirmed,
}: {
  initiative: Initiative;
  creature: CreatureId;
  currentRound: Round;
  choices: Choice[];
  confirmed: boolean;
}) {
  const confirmChoices = useRecoilCallback(
    ({ set }) => (id: CreatureId, initiative: Initiative) => {
      set<ChoiceMap>(choicesForRoundMap(currentRound), (map) => {
        return _.mapValues(map, (choice) =>
          choice.creature === id
            ? { ...choice, confirmed_at: initiative }
            : choice
        );
      });
    },
    [currentRound]
  );

  const { name, type: creatureType } = useRecoilValue(creatureForId(creature));
  const surprised = useRecoilValue(
    creatureHasCondition([creature, "surprised"])
  );

  return (
    <Alert
      variant={
        confirmed ? "muted" : creatureType === "player" ? "primary" : "monster"
      }
      mb={1}
    >
      <Badge mr={2} variant={"muted"}>
        {total}
      </Badge>
      <b
        sx={{
          overflow: "scroll",
          whiteSpace: "nowrap",
          textOverflow: "clip",
        }}
      >
        {name}
      </b>
      {surprised && (
        <Badge ml={2} key={`${creature}_surprised`} variant={"surprised"}>
          surprised
        </Badge>
      )}
      {choices
        .slice()
        .sort((a, b) => choiceSortPartial(a, b))
        .map((choice) => (
          <>
            {" "}
            <Badge ml="2" key={`${choice.creature}_${choice.category}`}>
              {choice.category === "bonus"
                ? "B/A " + describeChoice(choice)
                : describeChoice(choice)}
            </Badge>
          </>
        ))}
      {!confirmed && (
        <Confirm
          ml="auto"
          mr={-2}
          onClick={() => confirmChoices(creature, total)}
        />
      )}
    </Alert>
  );
};

const NoChoices = function NoChoices() {
  const currentRound = useRecoilValue(currentRoundState);
  const creatures = useRecoilValue(noChoices(currentRound));

  return (
    <>
      {creatures.map((creature) => (
        <NoChoiceSummary key={creature} id={creature} />
      ))}
    </>
  );
};

const NoChoiceSummary = function NoChoiceSummary({ id }: { id: CreatureId }) {
  const { name } = useRecoilValue(creatureForId(id));
  const surprised = useRecoilValue(creatureHasCondition([id, "surprised"]));

  return (
    <Alert variant={"invisible"} mb={1}>
      <b>{name}</b>
      {surprised && (
        <Badge ml="2" key={`${id}_surprised`} variant={"surprised"}>
          surprised
        </Badge>
      )}
    </Alert>
  );
};
//      <Close ml="auto" mr={-2} />

const Init = function Init() {
  return (
    <RecoilRoot
      initializeState={({ set }) => {
        const encounter: Creature[] = [
          { name: "Orel", type: "player" },
          { name: "Steve", type: "player" },
          { name: "Rinn", type: "player" },
          { name: "Flying Snake 1", type: "monster" },
          { name: "Flying Snake 2", type: "monster" },
          { name: "Flying Snake 3", type: "monster" },
          { name: "Flying Snake 4", type: "monster" },
        ];
        const ids = encounter.map(() => getId());

        _.forEach(encounter, (creature, index) =>
          set<Creature>(creatureForId(ids[index]), creature)
        );
        set(creatureListState, ids);

        const round = 1;
        set(currentRoundState, round);
      }}
    >
      <h1>
        <RoundNumberHeading /> <NewRoundNumberButton />
      </h1>
      <Grid gap={3} columns={[1, null, "1fr 2fr"]}>
        <Box>
          <NoChoices />
          <ConfirmedChoices />
          <UnconfirmedChoices />
        </Box>
        <Box>
          <Choices />
        </Box>
      </Grid>
      <AddCreatureButton />
      <CreatureList />
    </RecoilRoot>
  );
};

export default Init;
