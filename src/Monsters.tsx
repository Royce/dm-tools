/** @jsx jsx */
import { jsx } from "theme-ui";
import React from "react";
import { RecoilRoot, selector, atom, useRecoilValue } from "recoil";
import axios from "axios";
import * as f from "fp-ts";

import MonsterComponent from "./MonsterComponent";
import { MonsterCodec, MonsterType } from "./MonsterType";

const monsterId = atom({ key: "monsterId", default: "bone-devil" });

const monsterQuery = selector<MonsterType>({
  key: "monsterQuery",
  get: async ({ get }) => {
    const monster: MonsterType = await axios
      .get(`srd/monster/${get(monsterId)}.json`)
      .then((r) => {
        const result = MonsterCodec.decode(r.data);
        if (f.either.isRight(result)) {
          return result.right;
        } else {
          throw result.left;
        }
      });
    return monster;
  },
});

const RandomMonster = function RandomMonster() {
  const monster = useRecoilValue(monsterQuery);
  return <MonsterComponent {...monster} />;
};

const Monsters = function Init() {
  return (
    <RecoilRoot>
      <h1>Heading</h1>
      <React.Suspense fallback={<div>Loading...</div>}>
        <RandomMonster />
      </React.Suspense>
    </RecoilRoot>
  );
};

export default Monsters;
