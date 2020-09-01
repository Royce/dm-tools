import React, { useState } from "react";
import ReactDOM from "react-dom";
import Initiative from "./Initiative";
import Monsters from "./Monsters";
import { ThemeProvider, Flex, NavLink, Box } from "theme-ui";
import theme from "./theme";

type Tab = "initiative" | "monsters";

const Everything = function Everything() {
  const [activeTab, setActiveTab] = useState<Tab>("initiative");
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
        <NavLink href="#!">Create</NavLink>
      </Flex>
      <Box p={2}>
        {activeTab === "initiative" && <Initiative />}
        {activeTab === "monsters" && <Monsters />}
      </Box>
    </ThemeProvider>
  );
};

ReactDOM.render(<Everything />, document.getElementById("root"));
