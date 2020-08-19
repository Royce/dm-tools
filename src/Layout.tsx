import React from "react";
import { Collapse, Navbar, NavbarToggler, NavbarBrand, Nav } from "reactstrap";
import { useToggle } from "./hooks/useToggle";
export const Layout = function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuIsOpen, toggleMenu] = useToggle(false);
  return (
    <div>
      <Navbar color="inverse" light expand="md">
        <NavbarBrand href="/">Greyhawk Initiative</NavbarBrand>
        <NavbarToggler onClick={toggleMenu} />
        <Collapse isOpen={menuIsOpen} navbar>
          <Nav className="ml-auto" navbar></Nav>
        </Collapse>
      </Navbar>
      {children}
    </div>
  );
};
