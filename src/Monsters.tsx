import React from "react";
import { RecoilRoot, selector, atom, useRecoilValue } from "recoil";
import { Container } from "reactstrap";
import axios from "axios";
import * as f from "fp-ts";

import MonsterComponent from "./MonsterComponent";
import { MonsterCodec, MonsterType } from "./MonsterType";

const monsterId = atom({ key: "monsterId", default: "knight" });

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
      {/* <Layout> */}
      <Container fluid={true}>
        <h1>Heading</h1>
        <React.Suspense fallback={<div>Loading...</div>}>
          <RandomMonster />
        </React.Suspense>
      </Container>
      {/* </Layout> */}
    </RecoilRoot>
  );
};

export default Monsters;
