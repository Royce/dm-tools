import { atom, useSetRecoilState } from "recoil";
import { useCallback } from "react";
import _ from "lodash";
import { rng } from "../util/rng";
import { string } from "io-ts";

type Result = number | [number, number];
export type LogItem = {
  type: "basic";
  id: number;
  owner: string;
  desc: string;
  roll: string | number;
  result: Result;
};
export const logState = atom<LogItem[]>({
  key: "logState",
  default: [],
});

type LogItemWithoutResult = Omit<LogItem, "result" | "id">;

export const useRollAndAppendToLog = function useRollAndAppendToLog(): (
  item: LogItemWithoutResult
) => void {
  const setLog = useSetRecoilState(logState);

  return useCallback(
    (item: LogItemWithoutResult) => {
      var result: Result;
      const id = Math.random();

      if (_.isNumber(item.roll)) {
        let n = item.roll;
        result = [rng().roll(20) + n, rng().roll(20) + n];
      } else {
        let match = item.roll.match(
          /(?:(?<n>\d+)?d(?<size>\d+))?(?:\s*[-+]\s*(?<mod>\d+))?/
        );
        console.log(match);
        if (match !== null && "groups" in match && match.groups !== undefined) {
          let size = Number(match.groups.size) || 20;
          let n = Number(match.groups.n) || 1;
          let mod = Number(match.groups.mod) || 0;
          if (size === 20 && n === 1)
            result = [rng().roll(20) + mod, rng().roll(20) + mod];
          else result = n * rng().roll(size) + mod;
        } else {
          result = NaN;
        }
      }
      setLog((log) => [...log, { ...item, result, id }]);
    },
    [setLog]
  );
};
