import { useCallback, useState } from "react";

export const useToggle = function(
  initialState: boolean
): [boolean, () => void] {
  const [state, setState] = useState(initialState);
  const toggle = useCallback(() => setState(!state), [state]);
  return [state, toggle];
};
