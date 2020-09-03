import React, { ReactElement } from "react";
import { IconButton } from "theme-ui";

export type ToggleButtonProps = {
  color?: string;
  onClick: () => void;
  on?: boolean;
  disabled: boolean;
  children: JSX.Element | null;
};

export const ToggleButton = function ({
  color,
  on,
  disabled,
  onClick,
  children,
}: ToggleButtonProps): ReactElement {
  return (
    <IconButton
      disabled={disabled}
      sx={{
        backgroundColor: on ? (disabled ? "muted" : color) : "background",
        color: on ? "background" : disabled ? "muted" : "text",
        border: "1px solid transparent",
        borderColor: on ? "transparent" : disabled ? "muted" : "text",
      }}
      onClick={onClick}
    >
      {children}
    </IconButton>
  );
};
