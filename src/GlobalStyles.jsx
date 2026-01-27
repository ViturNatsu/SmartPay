import { Global, css } from "@emotion/react";

export function GlobalStyles() {
  return (
    <Global
      styles={css`
        html,
        body {
          font-family: Inter, system-ui, -apple-system, 'Segoe UI',
            Roboto, Arial, sans-serif;
        }
      `}
    />
  );
}
