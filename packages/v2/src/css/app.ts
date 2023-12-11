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
  h1,
  h2 {
    text-align: center;
    width: 100%;
    line-height: 1.1em;
    margin-bottom: 0.25em;
    padding-bottom: 0.3em;
    border-bottom: 1px solid #eaecef;
  }
  header div {
    text-align: center;
    width: 100%;
  }
  #beat {
    float: right;
    font-size: 2.5rem;
    top: -0.25em;
    position: relative;
  }
  #beat.disconnected {
    color: #333;
  }
  a.logo {
    height: 2.5em !important;
    float: left;
    color: inherit;
  }
  .right {
    float: right;
  }
`;
