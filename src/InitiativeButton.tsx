import React from "react";
import { Button } from "reactstrap";
import { IconBaseProps } from "react-icons/lib/cjs";

export type InitiativeButtonProps = {
  color?: string;
  onClick: () => void;
  on?: boolean;
  children: any;
};

export const InitiativeButton = function({
  color,
  on,
  onClick,
  children
}: InitiativeButtonProps) {
  return (
    <Button
      outline={!on}
      size="sm"
      onClick={onClick}
      color={on ? color : undefined}
    >
      {children}
    </Button>
  );
};
