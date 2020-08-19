import React, { useState } from "react";
import {
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Container,
} from "reactstrap";
import ReactDOM from "react-dom";
import Initiative from "./Initiative";
import Monsters from "./Monsters";
import "bootstrap/dist/css/bootstrap.min.css";

type Tab = "initiative" | "monsters";

const Everything = function Everything() {
  const [activeTab, setActiveTab] = useState<Tab>("monsters");

  return (
    <Container fluid={true}>
      <Nav tabs={true}>
        <NavItem>
          <NavLink
            className={activeTab === "initiative" ? "active" : ""}
            onClick={() => setActiveTab("initiative")}
          >
            Initiative
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={activeTab === "monsters" ? "active" : ""}
            onClick={() => setActiveTab("monsters")}
          >
            Monsters
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent activeTab={activeTab}>
        <TabPane tabId={"initiative"}>
          {activeTab === "initiative" && <Initiative />}
        </TabPane>
        <TabPane tabId={"monsters"}>
          <Monsters />
        </TabPane>
      </TabContent>
    </Container>
  );
};

ReactDOM.render(<Everything />, document.getElementById("root"));
