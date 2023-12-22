import { css } from "lit";

export default css`
  .flex-grid-half {
    display: grid;
    grid-template-columns: 500px 2fr;
  }
  .flex-grid-half.expanded_entity,
  .flex-grid-half.expanded_logs {
    grid-template-columns: 1fr;
  }
  .flex-grid-half .col {
    margin: 8px;
  }
  .flex-grid-half .col:nth-child(2) {
    overflow: hidden;
  }
  .flex-grid-half.expanded_logs .col:nth-child(1) {
    display: none;
  }
  .flex-grid-half.expanded_entity .col:nth-child(2) {
    display: none;
  }

  @media (max-width: 1024px) {
    .flex-grid,
    .flex-grid-half {
      display: block;
    }
    .flex-grid-half .col {
      width: 100% !important;
      margin: 0 0 10px 0 !important;
      display: block !important;
    }
  }

  * {
    box-sizing: border-box;
  }
  .flex-grid {
    margin: 0 0 20px 0;
  }
  h1 {
    text-align: center;
    width: 100%;
    line-height: 1.1em;
    margin-block: 0.25em;
  }
  header div {
    text-align: center;
    width: 100%;
  }
  header #logo,
  header iconify-icon {
    float: right;
    font-size: 2.5rem;
    color: rgba(127, 127, 127, 0.5);
  }
  header #logo {
    float: left;
    color: rgba(127, 127, 127, 0.5);
  }
  esp-logo {
    float: left;
    line-height: 1em;
    font-size: initial;
  }
  form {
    display: flex;
    justify-content: space-between;
    background-color: rgba(127, 127, 127, 0.05);
    border-radius: 12px;
    border-width: 1px;
    border-style: solid;
    border-color: rgba(127, 127, 127, 0.12);
  }
  form .btn {
    margin-right: 0px;
  }
`;
