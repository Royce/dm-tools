import React, { useState, useCallback } from "react";
import ReactDOM from "react-dom";
import { RecoilRoot } from "recoil";

import Initiative from "./Initiative";
import Monsters from "./Monsters";
import CreateMonster from "./CreateMonster";
import Log from "./log/Log";

import { ThemeProvider, Flex, NavLink, Box } from "theme-ui";
import theme from "./theme";

type Tab = "initiative" | "monsters" | "create-monster" | "log";

const Everything = function Everything() {
  const [activeTab, setActiveTab] = useState<Tab>("monsters");
  const highlightTabSx = { bg: "gold" };

  return (
    <ThemeProvider theme={theme}>
      <Flex as="nav" p={2} bg="accent">
        <NavLink
          href="#!"
          onClick={() => setActiveTab("initiative")}
          sx={activeTab === "initiative" ? highlightTabSx : {}}
        >
          Initiative
        </NavLink>
        <NavLink
          href="#!"
          onClick={() => setActiveTab("monsters")}
          sx={activeTab === "monsters" ? highlightTabSx : {}}
        >
          Monsters
        </NavLink>
        <NavLink
          href="#!"
          onClick={() => setActiveTab("create-monster")}
          sx={activeTab === "create-monster" ? highlightTabSx : {}}
        >
          Create
        </NavLink>
      </Flex>
      <RecoilRoot>
        <Box p={2}>
          {activeTab === "initiative" && <Initiative />}
          {activeTab === "monsters" && <Monsters />}
          {activeTab === "create-monster" && <CreateMonster />}
        </Box>
        <Log />
      </RecoilRoot>
    </ThemeProvider>
  );
};

ReactDOM.render(<Everything />, document.getElementById("root"));
