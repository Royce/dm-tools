/** @jsx jsx */
import { jsx } from "theme-ui";
import React from "react";
import { RecoilRoot, selector, atom, useRecoilValue } from "recoil";

import MonsterComponent from "./MonsterComponent";
import { MonsterCodec, MonsterType } from "./MonsterType";
import { humanoid, sneak } from "./util/createMonster";

const Monster = function RandomMonster() {
  const cr = 1;
  const gen = sneak(humanoid("Sneak", cr));

  return (
    <React.Fragment>
      Quota: {gen.damage_quota}, Best: +{gen.best_roll},
      <hr />
      <MonsterComponent {...gen} />
    </React.Fragment>
  );
};

const CreateMonster = function Init() {
  return (
    <React.Fragment>
      <h1>Create Monster</h1>
      <React.Suspense fallback={<div>Loading...</div>}>
        <Monster />
      </React.Suspense>
    </React.Fragment>
  );
};

export default CreateMonster;
