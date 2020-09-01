import React from "react";
import { IconButton, IconButtonProps } from "theme-ui";

const icon = (
  // <svg
  //   xmlns="http://www.w3.org/2000/svg"
  //   width="24"
  //   height="24"
  //   fill="currentcolor"
  //   viewBox="0 0 24 24"
  // >
  //   <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  // </svg>
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
