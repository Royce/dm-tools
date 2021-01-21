/* @jsx jsx */
import { jsx } from "theme-ui";
import React from "react";
import { numberToStringWithSign } from "../util/numberToStringWithSign";
import { useRollAndAppendToLog } from "./state";

export const RollableText = function Rollable(props: {
  owner: string;
  desc: string;
  roll?: string | number;
  children: string | number;
}) {
  const rollAndAppend = useRollAndAppendToLog();

  return (
    <span
      sx={{ color: "primary" }}
      onClick={() =>
        rollAndAppend({
          type: "basic",
          roll: props.roll || props.children,
          owner: props.owner,
          desc: props.desc,
        })
      }
    >
      {typeof props.children === "string"
        ? props.children
        : numberToStringWithSign(props.children)}
    </span>
  );
};
