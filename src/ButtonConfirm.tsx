import React from "react";
import { IconButton, IconButtonProps } from "theme-ui";

const icon = (
  <svg
    stroke="currentColor"
    fill="none"
    stroke-width="2"
    viewBox="0 0 24 24"
    stroke-linecap="round"
    stroke-linejoin="round"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <polyline points="22 2 8 22 1 14"></polyline>
  </svg>
);

type ForwardRef<T, P> = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<P> & React.RefAttributes<T>
>;

interface ConfirmProps extends Omit<IconButtonProps, "children"> {}

export const Confirm: ForwardRef<
  HTMLButtonElement,
  ConfirmProps
> = React.forwardRef(({ ...props }, ref) => (
  <IconButton
    ref={ref}
    title="Confirm"
    aria-label="Confirm"
    variant="confirm"
    {...props}
    children={icon}
  />
));
