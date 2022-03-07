import { css } from "lit";

export default css`
  button,
  .btn {
    cursor: pointer;
    border-radius: 4px;
    background-color: inherit;
    background-image: linear-gradient(
      0deg,
      rgba(127, 127, 127, 0.5) 0%,
      rgba(127, 127, 127, 0.5) 100%
    );
    color: inherit;
    border: 1px solid rgba(127, 127, 127, 0.5);
    padding: 2px;
  }

  button:active,
  .btn:active {
    background-image: linear-gradient(
      0deg,
      rgba(127, 127, 127, 0.8) 0%,
      rgba(127, 127, 127, 0.2) 100%
    );
    transition-duration: 1s;
  }

  button:hover,
  .btn:hover {
    background-image: linear-gradient(
      0deg,
      rgba(127, 127, 127, 0.2) 0%,
      rgba(127, 127, 127, 0.8) 100%
    );
    transition-duration: 1s;
  }

  .rnd {
    border-radius: 1rem;
    height: 2rem;
    width: 2rem;
    font-weight: 500;
    font-size: 1.2rem;
  }
`;
