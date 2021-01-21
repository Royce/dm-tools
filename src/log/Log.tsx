import React, { useEffect, useRef, useState } from "react";
import { Box, Flex, Text, Card, Input, Heading, Close } from "theme-ui";

import { useRecoilValue, useRecoilTransactionObserver_UNSTABLE } from "recoil";
import _ from "lodash";

import { logState, LogItem } from "./state";
import { numberToStringWithSign } from "../util/numberToStringWithSign";

type Mode = "closed" | "open";

const Log = function Log() {
  const numberToShow = 3;
  const [mode, setMode] = useState<Mode>("closed");
  const input: any = useRef(null);
  const [recent, setRecent] = useState<number>();
  const log = useRecoilValue(logState);

  const lastId = log[log.length - 1]?.id;
  const isNewItem = recent !== lastId;
  if (isNewItem) {
    setRecent(lastId);
    setMode("open");
  }

  return (
    <Card
      variant="log"
      sx={{
        position: "fixed",
        bottom: 0,
        right: 0,
      }}
    >
      {(mode === "open" || isNewItem) && (
        <React.Fragment>
          <Flex>
            <Text sx={{ flexGrow: 1 }}>Dice Log</Text>
            <Close onClick={() => setMode("closed")} />
          </Flex>
          <Box bg="secondary" color="background">
            {log
              .slice(Math.max(0, log.length - numberToShow), log.length)
              .map((item) =>
                item.type === "basic" ? (
                  <BasicLogItem key={item.id} {...item} />
                ) : (
                  <pre>{JSON.stringify(item, null, 2)}</pre>
                )
              )}
          </Box>
        </React.Fragment>
      )}
      <Input backgroundColor="background" ref={input} />
    </Card>
  );
};

export default Log;

function BasicLogItem(props: LogItem) {
  return (
    <Box p={1}>
      <Flex>
        <Box sx={{ flexGrow: 1 }}>
          <Text pr={1} variant="inline">
            {props.owner}, {props.desc}
          </Text>
        </Box>
        <Box>
          <Text color="muted">
            {_.isNumber(props.roll)
              ? numberToStringWithSign(props.roll)
              : props.roll}
          </Text>
        </Box>
      </Flex>
      <Box sx={{ borderTop: "separator", borderTopColor: "secondary" }}>
        {_.isArray(props.result) ? (
          <Flex>
            <Text>{props.result[0]}</Text>
            <Text px={2}>•</Text>
            <Text>{props.result[1]}</Text>
          </Flex>
        ) : (
          <Text>{props.result}</Text>
        )}
      </Box>
    </Box>
  );
}
