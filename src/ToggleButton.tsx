import React from "react";
import { Button } from "reactstrap";

export type ToggleButtonProps = {
  color?: string;
  onClick: () => void;
  on?: boolean;
  disabled: boolean;
  children: any;
};

export const ToggleButton = function ({
  color,
  on,
  disabled,
  onClick,
  children,
}: ToggleButtonProps) {
  return (
    <Button
      disabled={disabled}
      outline={!on}
      size="sm"
      onClick={onClick}
      color={on ? color : undefined}
    >
      {children}
    </Button>
  );
};
