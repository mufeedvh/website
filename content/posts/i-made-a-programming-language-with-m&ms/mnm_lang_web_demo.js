(() => {
  "use strict";

  const COLOR_NAMES = {
    B: "blue",
    G: "green",
    R: "red",
    Y: "yellow",
    O: "orange",
    N: "brown",
  };

  const COLOR_RGB = {
    B: [37, 123, 226],
    G: [58, 173, 80],
    R: [228, 57, 52],
    Y: [236, 192, 34],
    O: [234, 129, 36],
    N: [124, 69, 46],
  };

  const OPERAND_KIND_BY_COLOR = {
    R: "integer",
    G: "variable",
    Y: "string",
    B: "label",
    O: "input_queue",
  };

  const OPCODES = {
    B: { mnemonic: "JMP", operandKinds: ["label"] },
    BB: { mnemonic: "JZ", operandKinds: ["label"] },
    BBB: { mnemonic: "JNZ", operandKinds: ["label"] },
    BBBB: { mnemonic: "CALL", operandKinds: ["label"] },
    BBBBB: { mnemonic: "RET", operandKinds: [] },
    BBBBBB: { mnemonic: "HALT", operandKinds: [] },
    G: { mnemonic: "PUSH", operandKinds: ["integer"] },
    GG: { mnemonic: "LOAD", operandKinds: ["variable"] },
    GGG: { mnemonic: "STORE", operandKinds: ["variable"] },
    GGGG: { mnemonic: "DUP", operandKinds: [] },
    GGGGG: { mnemonic: "POP", operandKinds: [] },
    GGGGGG: { mnemonic: "INC", operandKinds: ["variable"] },
    GGGGGGG: { mnemonic: "DEC", operandKinds: ["variable"] },
    Y: { mnemonic: "ADD", operandKinds: [] },
    YY: { mnemonic: "SUB", operandKinds: [] },
    YYY: { mnemonic: "MUL", operandKinds: [] },
    YYYY: { mnemonic: "DIV", operandKinds: [] },
    YYYYY: { mnemonic: "MOD", operandKinds: [] },
    YYYYYY: { mnemonic: "EQ", operandKinds: [] },
    YYYYYYY: { mnemonic: "LT", operandKinds: [] },
    YYYYYYYY: { mnemonic: "GT", operandKinds: [] },
    O: { mnemonic: "PRINT", operandKinds: [] },
    OO: { mnemonic: "PRINT_STR", operandKinds: ["string"] },
    OOO: { mnemonic: "READ_INT", operandKinds: ["input_queue"] },
    OOOO: { mnemonic: "READ_STR", operandKinds: ["input_queue"] },
    OOOOO: { mnemonic: "EMIT_CHAR", operandKinds: [] },
    OOOOOO: { mnemonic: "NEWLINE", operandKinds: [] },
    N: { mnemonic: "LABEL", operandKinds: ["label"] },
    NN: { mnemonic: "PUSH_STR", operandKinds: ["string"] },
    NNN: { mnemonic: "CONCAT", operandKinds: [] },
    NNNN: { mnemonic: "LEN", operandKinds: [] },
    NNNNN: { mnemonic: "TO_INT", operandKinds: [] },
    NNNNNN: { mnemonic: "TO_STR", operandKinds: [] },
    R: { mnemonic: "SWAP", operandKinds: [] },
    RR: { mnemonic: "ROT", operandKinds: [] },
    RRR: { mnemonic: "AND", operandKinds: [] },
    RRRR: { mnemonic: "OR", operandKinds: [] },
    RRRRR: { mnemonic: "NOT", operandKinds: [] },
  };

  const EXAMPLES = {
    hello_world: {
      title: "hello_world",
      description: "The smallest possible cheerful MNM Lang program.",
      source: "OO Y\nOOOOOO\nBBBBBB",
      sidecar: {
        strings: ["Hello, world!"],
        variables: [],
        inputs: { int: [], str: [] },
      },
    },
    echo_name: {
      title: "echo_name",
      description: "Greets the first string in queue 0.",
      source: "NN Y\nOOOO O\nNNN\nO\nOOOOOO\nBBBBBB",
      sidecar: {
        strings: ["Hello, "],
        variables: [],
        inputs: { int: [], str: [["Ada"]] },
      },
    },
    factorial: {
      title: "factorial",
      description: "Loops over n and computes n! using labels and variables.",
      source: [
        "OOO O",
        "GGG G",
        "G RR",
        "GGG GG",
        "N B",
        "GG G",
        "G RR",
        "YYYYYYYY",
        "BB BB",
        "GG GG",
        "GG G",
        "YYY",
        "GGG GG",
        "GGGGGGG G",
        "B B",
        "N BB",
        "GG GG",
        "O",
        "OOOOOO",
        "BBBBBB",
      ].join("\n"),
      sidecar: {
        strings: [],
        variables: [0, 0],
        inputs: { int: [[5]], str: [] },
      },
    },
    fizzbuzz: {
      title: "fizzbuzz",
      description: "Mandatory. And yes, it really works.",
      source: [
        "N B",
        "GG G",
        "GG GG",
        "YYYYYYYY",
        "BBB BBBBBB",
        "GG G",
        "GG GGG",
        "YYYYY",
        "BB BB",
        "GG G",
        "GG GGGG",
        "YYYYY",
        "BB BBB",
        "GG G",
        "GG GGGGG",
        "YYYYY",
        "BB BBBB",
        "GG G",
        "O",
        "B BBBBB",
        "N BB",
        "OO Y",
        "B BBBBB",
        "N BBB",
        "OO YY",
        "B BBBBB",
        "N BBBB",
        "OO YYY",
        "N BBBBB",
        "OOOOOO",
        "GGGGGG G",
        "B B",
        "N BBBBBB",
        "BBBBBB",
      ].join("\n"),
      sidecar: {
        strings: ["FizzBuzz", "Fizz", "Buzz"],
        variables: [1, 15, 15, 3, 5],
        inputs: { int: [], str: [] },
      },
    },
  };

  const INJECTED_STYLES = `
    :root {
      --mnm-bg: var(--bg, #121110);
      --mnm-surface: var(--bg-raised, #1a1917);
      --mnm-card: var(--bg, #121110);
      --mnm-hover: var(--bg-hover, #211f1c);
      --mnm-text: var(--ink, #e8e3da);
      --mnm-secondary: var(--ink-2, #aaa49b);
      --mnm-tertiary: var(--ink-3, #847d75);
      --mnm-border-soft: var(--line, rgba(232, 227, 218, 0.1));
      --mnm-border-strong: var(--line-2, rgba(232, 227, 218, 0.2));
      --mnm-border-dotted: var(--line-2, rgba(232, 227, 218, 0.2));
      --mnm-white: var(--ink, #e8e3da);
    }
    .mnm-widget {
      position: relative;
      display: grid;
      gap: clamp(14px, 2vw, 22px);
      padding: clamp(16px, 2vw, 24px);
      border: 1px solid var(--mnm-border-dotted);
      background: var(--mnm-surface);
      container-type: inline-size;
      color: var(--mnm-text);
      overflow: clip;
      max-width: 100%;
      box-sizing: border-box;
    }
    .mnm-widget[data-mode="inline"] {
      margin: 22px 0;
    }
    .mnm-widget[data-mode="full"] {
      padding: clamp(18px, 2.2vw, 28px);
    }
    .mnm-topline {
      display: grid;
      gap: 8px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--mnm-border-dotted);
    }
    .mnm-kicker {
      margin: 0;
      font-family: var(--font-mono, monospace);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      font-size: 0.72rem;
      color: var(--mnm-tertiary);
    }
    .mnm-title {
      margin: 0;
      font-family: var(--font-serif, serif);
      font-size: clamp(1.55rem, 2.35vw, 2.15rem);
      line-height: 1.08;
      font-weight: 500;
    }
    .mnm-description {
      margin: 0;
      max-width: 60ch;
      color: var(--mnm-secondary);
      line-height: 1.6;
      font-size: 1.02rem;
      font-family: var(--font-serif, serif);
    }
    .mnm-workbench {
      display: grid;
      grid-template-columns: minmax(280px, 1.08fr) minmax(260px, 0.92fr);
      gap: clamp(14px, 2vw, 22px);
      align-items: start;
    }
    @container (max-width: 880px) {
      .mnm-workbench {
        grid-template-columns: 1fr;
      }
    }
    .mnm-column {
      display: grid;
      gap: 14px;
      min-width: 0;
    }
    .mnm-surface {
      display: grid;
      gap: 12px;
      padding: clamp(14px, 1.8vw, 18px);
      background: var(--mnm-card);
      border: 1px solid var(--mnm-border-dotted);
      min-width: 0;
    }
    .mnm-surface-heading {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .mnm-surface-heading h3 {
      margin: 0;
      font-family: var(--font-mono, monospace);
      font-size: 0.76rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--mnm-secondary);
    }
    .mnm-field,
    .mnm-output,
    .mnm-tree {
      width: 100%;
      border: 1px solid var(--mnm-border-dotted);
      border-radius: 0;
      padding: 16px;
      background: var(--mnm-card);
      color: var(--mnm-text);
      font: 500 0.95rem/1.7 var(--font-mono, monospace);
      resize: vertical;
      min-height: 170px;
      caret-color: var(--mnm-white);
    }
    .mnm-field {
      min-height: 180px;
      background: transparent;
      color: transparent;
      -webkit-text-fill-color: transparent;
      position: relative;
      z-index: 1;
      overflow: auto;
      display: block;
    }
    .mnm-sidecar {
      min-height: 180px;
    }
    .mnm-field,
    .mnm-output,
    .mnm-tree,
    .mnm-editor-shell {
      scrollbar-width: thin;
      scrollbar-color: var(--mnm-border-strong) transparent;
    }
    .mnm-field::-webkit-scrollbar,
    .mnm-output::-webkit-scrollbar,
    .mnm-tree::-webkit-scrollbar,
    .mnm-editor-shell::-webkit-scrollbar {
      width: 5px;
      height: 5px;
    }
    .mnm-field::-webkit-scrollbar-track,
    .mnm-output::-webkit-scrollbar-track,
    .mnm-tree::-webkit-scrollbar-track,
    .mnm-editor-shell::-webkit-scrollbar-track {
      background: transparent;
    }
    .mnm-field::-webkit-scrollbar-thumb,
    .mnm-output::-webkit-scrollbar-thumb,
    .mnm-tree::-webkit-scrollbar-thumb,
    .mnm-editor-shell::-webkit-scrollbar-thumb {
      background-color: var(--mnm-border-strong);
      border-radius: 3px;
    }
    .mnm-editor-shell {
      position: relative;
      border: 1px solid var(--mnm-border-dotted);
      background: var(--mnm-bg);
      overflow-x: auto;
    }
    .mnm-editor-backdrop,
    .mnm-field {
      margin: 0;
      padding: 14px 16px;
      white-space: pre-wrap;
      overflow-wrap: normal;
      word-break: normal;
      tab-size: 2;
    }
    .mnm-editor-backdrop {
      position: absolute;
      inset: 0;
      pointer-events: none;
      color: var(--mnm-text);
      font: 500 0.95rem/1.7 var(--font-mono, monospace);
      overflow: hidden;
    }
    .mnm-json-punc,
    .mnm-json-key,
    .mnm-json-string,
    .mnm-json-number,
    .mnm-json-boolean,
    .mnm-json-null,
    .mnm-token-blue,
    .mnm-token-green,
    .mnm-token-red,
    .mnm-token-yellow,
    .mnm-token-orange,
    .mnm-token-brown {
      transition: color 0.1s ease;
    }
    .mnm-json-punc { color: var(--mnm-secondary); }
    .mnm-json-key { color: var(--mnm-text); }
    .mnm-json-string { color: #9ecbff; }
    .mnm-json-number { color: #79c0ff; }
    .mnm-json-boolean { color: #e0a4ff; }
    .mnm-json-null { color: #ffab70; }
    .mnm-token-blue { color: #6eb5ff; }
    .mnm-token-green { color: #7dce82; }
    .mnm-token-red { color: #f97583; }
    .mnm-token-yellow { color: #e8d44d; }
    .mnm-token-orange { color: #ffab70; }
    .mnm-token-brown { color: #c9a06c; }
    .mnm-code-error {
      color: var(--mnm-white);
      opacity: 0.82;
    }
    .mnm-output {
      white-space: pre-wrap;
      overflow-x: auto;
    }
    .mnm-tree {
      white-space: pre;
      overflow: auto;
    }
    .mnm-output {
      min-height: 80px;
    }
    .mnm-tree {
      min-height: 100px;
      max-height: 300px;
      overflow-y: auto;
      color: var(--mnm-secondary);
    }
    .mnm-controls,
    .mnm-example-row {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .mnm-button,
    .mnm-chip {
      appearance: none;
      border: 1px solid var(--mnm-border-dotted);
      cursor: pointer;
      border-radius: 0;
      padding: 11px 14px;
      background: transparent;
      color: var(--mnm-secondary);
      font: 500 0.72rem/1 var(--font-mono, monospace);
      text-transform: uppercase;
      letter-spacing: 0.14em;
      transition: border-color 0.1s ease, color 0.1s ease, background-color 0.1s ease;
    }
    .mnm-button:hover,
    .mnm-chip:hover {
      border-style: solid;
      border-color: var(--mnm-white);
      color: var(--mnm-white);
      background: var(--mnm-hover);
    }
    .mnm-button:focus-visible,
    .mnm-chip:focus-visible,
    .mnm-field:focus-visible {
      outline: 1px solid var(--mnm-white);
      outline-offset: 3px;
    }
    .mnm-button-primary,
    .mnm-button-secondary,
    .mnm-chip {
      background: transparent;
    }
    .mnm-chip[data-active="true"] {
      border-style: solid;
      border-color: var(--mnm-white);
      color: var(--mnm-text);
      background: var(--mnm-hover);
    }
    .mnm-tri-pane {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr);
      gap: 10px;
      align-items: stretch;
    }
    .mnm-tri-pane > * {
      min-width: 0;
      overflow: hidden;
    }
    .mnm-tri-pane .mnm-surface {
      padding: 8px;
      gap: 6px;
    }
    .mnm-tri-pane .mnm-surface-heading h3 {
      font-size: 0.62rem;
    }
    .mnm-tri-pane .mnm-render-canvas {
      max-height: 240px;
    }
    .mnm-tri-pane .mnm-render-stage {
      padding: 6px;
    }
    .mnm-tri-pane .mnm-tree {
      max-height: 260px;
      min-height: 40px;
      font-size: 0.72rem;
      line-height: 1.5;
      padding: 8px;
      overflow: auto;
      border: none;
    }
    .mnm-tri-pane details.mnm-detail {
      border-top: none;
      padding: 8px;
      background: var(--mnm-card);
      border: 1px solid var(--mnm-border-dotted);
    }
    .mnm-tri-pane details.mnm-detail summary {
      font-size: 0.62rem;
      margin-bottom: 6px;
    }
    .mnm-tri-pane details.mnm-detail[open] summary {
      margin-bottom: 6px;
    }
    @container (max-width: 560px) {
      .mnm-tri-pane {
        grid-template-columns: 1fr;
      }
      .mnm-tri-pane details.mnm-detail {
        border-top: 1px solid var(--mnm-border-dotted);
        padding-top: 10px;
      }
    }
    .mnm-render-stage {
      position: relative;
      display: flex;
      justify-content: center;
      padding: 12px;
      background: var(--mnm-bg);
      border: 1px solid var(--mnm-border-dotted);
    }
    .mnm-render-canvas {
      width: auto;
      max-width: 100%;
      max-height: 360px;
      object-fit: contain;
      display: block;
      border-radius: 0;
      background: transparent;
    }
    .mnm-status {
      margin: 0;
      min-height: 1.4em;
      color: var(--mnm-secondary);
      font-size: 0.76rem;
      font-family: var(--font-mono, monospace);
      text-transform: uppercase;
      letter-spacing: 0.12em;
    }
    details.mnm-detail {
      border-top: 1px solid var(--mnm-border-dotted);
      padding-top: 10px;
    }
    details.mnm-detail summary {
      cursor: pointer;
      font-size: 0.72rem;
      color: var(--mnm-secondary);
      font-family: var(--font-mono, monospace);
      text-transform: uppercase;
      letter-spacing: 0.14em;
      list-style: none;
      display: flex;
      align-items: center;
      gap: 0.5em;
      transition: color 0.15s ease;
    }
    details.mnm-detail summary::before {
      content: '▸';
      font-size: 0.7em;
      transition: transform 0.2s ease;
    }
    details.mnm-detail summary::-webkit-details-marker {
      display: none;
    }
    details.mnm-detail[open] summary {
      margin-bottom: 10px;
      color: var(--mnm-text);
    }
    details.mnm-detail[open] summary::before {
      transform: rotate(90deg);
    }
    details.mnm-detail .mnm-tree {
      animation: mnm-slide-in 0.2s ease;
    }
    @keyframes mnm-slide-in {
      from { opacity: 0; transform: translateY(-6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .mnm-error {
      color: var(--mnm-white);
    }
    .mnm-button[disabled],
    .mnm-chip[disabled] {
      opacity: 0.45;
      cursor: progress;
    }
    .mnm-field::selection,
    .mnm-output::selection,
    .mnm-tree::selection {
      background: rgba(255, 255, 255, 0.14);
    }
    .mnm-widget[data-mode="inline"] .mnm-title {
      font-size: clamp(1.3rem, 2vw, 1.7rem);
    }
    .mnm-widget[data-mode="inline"] .mnm-workbench {
      grid-template-columns: 1fr;
    }
    .mnm-widget[data-mode="inline"] .mnm-output,
    .mnm-widget[data-mode="inline"] .mnm-tree {
      min-height: 80px;
    }
    .mnm-widget[data-mode="inline"] .mnm-render-stage {
      overflow-x: auto;
      justify-content: center;
    }
    @container (max-width: 620px) {
      .mnm-widget {
        padding: 14px;
        margin-left: auto;
        margin-right: auto;
      }
      .mnm-render-canvas {
        max-height: 280px;
        width: auto;
        object-fit: contain;
      }
      .mnm-topline {
        gap: 6px;
        padding-bottom: 10px;
      }
      .mnm-title {
        font-size: 1.28rem;
        line-height: 1.06;
      }
      .mnm-description {
        font-size: 0.98rem;
        line-height: 1.45;
      }
      .mnm-workbench {
        gap: 12px;
      }
      .mnm-column {
        gap: 12px;
      }
      .mnm-surface {
        padding: 10px;
        gap: 10px;
      }
      .mnm-field,
      .mnm-output,
      .mnm-tree {
        padding: 10px 12px;
        font-size: 0.82rem;
        line-height: 1.55;
        min-height: 80px;
      }
      .mnm-sidecar {
        min-height: 70px;
      }
      .mnm-editor-backdrop,
      .mnm-field {
        padding: 12px 14px;
        font-size: 0.82rem;
        line-height: 1.55;
      }
      .mnm-controls {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
      .mnm-button,
      .mnm-chip {
        width: 100%;
        padding: 10px 8px;
        font-size: 0.64rem;
        letter-spacing: 0.12em;
      }
      .mnm-render-stage {
        padding: 8px;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
      .mnm-render-canvas {
        max-width: 100%;
        height: auto;
      }
      .mnm-output {
        min-height: 70px;
      }
      .mnm-tree {
        min-height: 80px;
        max-height: 220px;
        overflow-y: auto;
      }
      details.mnm-detail summary,
      .mnm-status,
      .mnm-surface-heading h3,
      .mnm-kicker {
        font-size: 0.66rem;
      }
    }
    @container (max-width: 420px) {
      .mnm-widget {
        padding: 10px;
        gap: 10px;
      }
      .mnm-surface {
        padding: 8px;
      }
      .mnm-field,
      .mnm-editor-backdrop {
        padding: 8px 10px;
        font-size: 0.75rem;
        min-height: 70px;
      }
      .mnm-output {
        padding: 8px 10px;
        font-size: 0.75rem;
        min-height: 60px;
      }
      .mnm-tree {
        padding: 8px 10px;
        font-size: 0.7rem;
        min-height: 60px;
        max-height: 160px;
        overflow-y: auto;
      }
      .mnm-sidecar {
        min-height: 60px;
      }
      .mnm-title {
        font-size: 1.12rem;
      }
      .mnm-description {
        font-size: 0.88rem;
        line-height: 1.4;
      }
      .mnm-controls {
        gap: 6px;
      }
      .mnm-button {
        padding: 9px 6px;
        font-size: 0.6rem;
      }
      .mnm-render-stage {
        padding: 6px;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        justify-content: center;
      }
      .mnm-render-canvas {
        max-width: 100%;
        max-height: 220px;
        width: auto;
        object-fit: contain;
      }
      .mnm-workbench {
        gap: 10px;
      }
      .mnm-column {
        gap: 10px;
      }
    }
    @container (max-width: 340px) {
      .mnm-widget {
        padding: 8px;
        gap: 8px;
        margin-left: auto;
        margin-right: auto;
      }
      .mnm-render-canvas {
        max-height: 180px;
      }
      .mnm-topline {
        gap: 4px;
        padding-bottom: 8px;
      }
      .mnm-title {
        font-size: 1rem;
      }
      .mnm-description {
        font-size: 0.84rem;
      }
      .mnm-surface {
        padding: 6px;
        gap: 6px;
      }
      .mnm-field,
      .mnm-editor-backdrop {
        padding: 6px 8px;
        font-size: 0.7rem;
        min-height: 56px;
      }
      .mnm-output {
        min-height: 48px;
      }
      .mnm-tree {
        min-height: 48px;
        max-height: 140px;
      }
      .mnm-sidecar {
        min-height: 48px;
      }
      .mnm-controls {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 5px;
      }
      .mnm-button, .mnm-chip {
        padding: 8px 4px;
        font-size: 0.56rem;
        letter-spacing: 0.08em;
      }
      .mnm-surface-heading h3,
      .mnm-kicker,
      .mnm-status,
      details.mnm-detail summary {
        font-size: 0.58rem;
      }
    }
  `;

  class MnmError extends Error {
    constructor(message, line = null, column = null) {
      super(message);
      this.name = "MnmError";
      this.line = line;
      this.column = column;
    }

    toString() {
      let location = "";
      if (this.line !== null && this.line !== undefined) {
        location = `line ${this.line}`;
        if (this.column !== null && this.column !== undefined) {
          location += `, column ${this.column}`;
        }
        location += ": ";
      }
      return `${location}${this.message}`;
    }
  }

  function shortRepr(value, maxLength = 48) {
    const rendered = JSON.stringify(value);
    if (rendered && rendered.length <= maxLength) {
      return rendered;
    }
    const fallback = String(value);
    return fallback.length <= maxLength ? fallback : `${fallback.slice(0, maxLength - 3)}...`;
  }

  function summarizeSequence(values, maxItems = 6) {
    if (!values.length) {
      return "[]";
    }
    const items = values.slice(0, maxItems).map((value) => shortRepr(value, 18));
    if (values.length > maxItems) {
      items.push(`... +${values.length - maxItems} more`);
    }
    return `[${items.join(", ")}]`;
  }

  function createTreeNode(label) {
    return { label, children: [] };
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/gu, "&amp;")
      .replace(/</gu, "&lt;")
      .replace(/>/gu, "&gt;")
      .replace(/"/gu, "&quot;")
      .replace(/'/gu, "&#39;");
  }

  function renderTree(node) {
    const lines = [node.label];
    node.children.forEach((child, index) => {
      lines.push(...renderChildLines(child, "", index === node.children.length - 1));
    });
    return lines.join("\n");
  }

  function renderChildLines(node, prefix, isLast) {
    const connector = isLast ? "`-- " : "|-- ";
    const lines = [`${prefix}${connector}${node.label}`];
    const childPrefix = `${prefix}${isLast ? "    " : "|   "}`;
    node.children.forEach((child, index) => {
      lines.push(...renderChildLines(child, childPrefix, index === node.children.length - 1));
    });
    return lines;
  }

  function stripComment(line) {
    return line.split("#", 1)[0].replace(/\s+$/u, "");
  }

  function highlightMnmSource(source) {
    return escapeHtml(String(source)).replace(/[BGRYON]/gu, (character) => {
      const className = {
        B: "mnm-token-blue",
        G: "mnm-token-green",
        R: "mnm-token-red",
        Y: "mnm-token-yellow",
        O: "mnm-token-orange",
        N: "mnm-token-brown",
      }[character];
      return `<span class="${className}">${character}</span>`;
    });
  }

  function highlightJsonText(text) {
    const escaped = escapeHtml(text);
    return escaped.replace(
      /("(?:\\.|[^"\\])*")\s*:|("(?:\\.|[^"\\])*")|(-?\d+(?:\.\d+)?)|\b(true|false)\b|\bnull\b|([{}\[\],:])/gu,
      (match, key, stringValue, numberValue, booleanValue, punctuation) => {
        if (key) {
          return `<span class="mnm-json-key">${key}</span><span class="mnm-json-punc">:</span>`;
        }
        if (stringValue) {
          return `<span class="mnm-json-string">${stringValue}</span>`;
        }
        if (numberValue) {
          return `<span class="mnm-json-number">${numberValue}</span>`;
        }
        if (booleanValue) {
          return `<span class="mnm-json-boolean">${booleanValue}</span>`;
        }
        if (match === "null") {
          return `<span class="mnm-json-null">null</span>`;
        }
        if (punctuation) {
          return `<span class="mnm-json-punc">${punctuation}</span>`;
        }
        return match;
      },
    );
  }

  function formatSidecarJson(raw) {
    return JSON.stringify(normalizeSidecar(raw), null, 2);
  }

  function syncEditorScroll(input, backdrop) {
    backdrop.scrollTop = input.scrollTop;
    backdrop.scrollLeft = input.scrollLeft;
  }

  function parseColorToken(token, line, column) {
    if (!token) {
      throw new MnmError("Empty token is not allowed.", line, column);
    }
    const first = token[0];
    for (const character of token) {
      if (character !== first) {
        throw new MnmError(`Token '${token}' mixes colors. Tokens must be one repeated letter.`, line, column);
      }
    }
    if (!COLOR_NAMES[first]) {
      throw new MnmError(`Token '${token}' uses unsupported color '${first}'.`, line, column);
    }
    return first;
  }

  function parseSource(source) {
    const instructions = [];
    const rows = [];
    const rawLines = String(source).replace(/\r\n?/gu, "\n").split("\n");

    rawLines.forEach((rawLine, lineIndex) => {
      const lineNumber = lineIndex + 1;
      const stripped = stripComment(rawLine).trim();
      if (!stripped) {
        return;
      }
      const words = stripped.split(/\s+/u);
      const tokens = [];
      let searchIndex = 0;
      words.forEach((word) => {
        const foundIndex = rawLine.indexOf(word, searchIndex);
        const column = (foundIndex === -1 ? 0 : foundIndex) + 1;
        searchIndex = (foundIndex === -1 ? searchIndex : foundIndex) + word.length;
        const color = parseColorToken(word, lineNumber, column);
        tokens.push({ text: word, color, line: lineNumber, column });
      });

      const opcode = OPCODES[tokens[0].text];
      if (!opcode) {
        throw new MnmError(`Unknown opcode token '${tokens[0].text}'.`, lineNumber, tokens[0].column);
      }
      if (tokens.length - 1 !== opcode.operandKinds.length) {
        throw new MnmError(
          `${opcode.mnemonic} expects ${opcode.operandKinds.length} operand(s), got ${tokens.length - 1}.`,
          lineNumber,
          tokens[0].column,
        );
      }

      const operands = tokens.slice(1).map((token, operandIndex) => {
        if (token.color === "N") {
          throw new MnmError(
            "Brown runs are reserved for opcodes and cannot be used as operands in v1.",
            token.line,
            token.column,
          );
        }
        const actualKind = OPERAND_KIND_BY_COLOR[token.color];
        const expectedKind = opcode.operandKinds[operandIndex];
        if (actualKind !== expectedKind) {
          throw new MnmError(
            `${opcode.mnemonic} expects a ${expectedKind} operand, got ${actualKind}.`,
            token.line,
            token.column,
          );
        }
        return {
          kind: expectedKind,
          value: token.text.length - 1,
          token,
        };
      });

      const sourceRow = tokens.map((token) => token.text).join(" ");
      instructions.push({
        opcode,
        operands,
        line: lineNumber,
        sourceRow,
      });
      rows.push(sourceRow);
    });

    if (!instructions.length) {
      throw new MnmError("Program is empty after removing comments and blank lines.");
    }

    const labels = {};
    const referenced = new Set();
    instructions.forEach((instruction, index) => {
      if (instruction.opcode.mnemonic === "LABEL") {
        const labelId = instruction.operands[0].value;
        if (labelId in labels) {
          throw new MnmError(`Duplicate label id ${labelId}.`, instruction.line, instruction.operands[0].token.column);
        }
        labels[labelId] = index;
      }
      if (["JMP", "JZ", "JNZ", "CALL"].includes(instruction.opcode.mnemonic)) {
        referenced.add(instruction.operands[0].value);
      }
    });

    const missing = [...referenced].filter((labelId) => !(labelId in labels)).sort((a, b) => a - b);
    if (missing.length) {
      throw new MnmError(`Unknown label reference(s): ${missing.join(", ")}.`);
    }

    return {
      instructions,
      labels,
      rows,
      canonicalSource: rows.join("\n"),
    };
  }

  function normalizeSidecar(raw) {
    if (!raw) {
      return { strings: [], variables: [], inputs: { int: [], str: [] } };
    }
    let payload = raw;
    if (typeof raw === "string") {
      try {
        payload = JSON.parse(raw);
      } catch (error) {
        throw new MnmError(`Sidecar JSON is invalid: ${error.message}.`);
      }
    }
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw new MnmError("Sidecar payload must be a JSON object.");
    }
    if (payload.strings !== undefined && !Array.isArray(payload.strings)) {
      throw new MnmError("strings must be a JSON array.");
    }
    if (payload.variables !== undefined && !Array.isArray(payload.variables)) {
      throw new MnmError("variables must be a JSON array.");
    }
    if (payload.inputs !== undefined && (!payload.inputs || typeof payload.inputs !== "object" || Array.isArray(payload.inputs))) {
      throw new MnmError("inputs must be a JSON object.");
    }
    const strings = Array.isArray(payload.strings) ? payload.strings.slice() : [];
    const variables = Array.isArray(payload.variables) ? payload.variables.slice() : [];
    const inputs = payload.inputs && typeof payload.inputs === "object" ? payload.inputs : {};
    if (inputs.int !== undefined && !Array.isArray(inputs.int)) {
      throw new MnmError("inputs.int must be a JSON array of queues.");
    }
    if (inputs.str !== undefined && !Array.isArray(inputs.str)) {
      throw new MnmError("inputs.str must be a JSON array of queues.");
    }
    const intQueues = Array.isArray(inputs.int) ? inputs.int.map((queue) => {
      if (!Array.isArray(queue)) {
        throw new MnmError("Each inputs.int entry must be an array.");
      }
      return queue.slice();
    }) : [];
    const strQueues = Array.isArray(inputs.str) ? inputs.str.map((queue) => {
      if (!Array.isArray(queue)) {
        throw new MnmError("Each inputs.str entry must be an array.");
      }
      return queue.slice();
    }) : [];

    strings.forEach((value, index) => {
      if (typeof value !== "string") {
        throw new MnmError(`strings[${index}] must be a string.`);
      }
    });
    variables.forEach((value, index) => {
      if (typeof value !== "string" && !Number.isInteger(value)) {
        throw new MnmError(`variables[${index}] must be an integer or string.`);
      }
    });
    intQueues.forEach((queue, queueIndex) => {
      if (!Array.isArray(queue)) {
        throw new MnmError(`inputs.int[${queueIndex}] must be an array.`);
      }
      queue.forEach((value, valueIndex) => {
        if (!Number.isInteger(value)) {
          throw new MnmError(`inputs.int[${queueIndex}][${valueIndex}] must be an integer.`);
        }
      });
    });
    strQueues.forEach((queue, queueIndex) => {
      if (!Array.isArray(queue)) {
        throw new MnmError(`inputs.str[${queueIndex}] must be an array.`);
      }
      queue.forEach((value, valueIndex) => {
        if (typeof value !== "string") {
          throw new MnmError(`inputs.str[${queueIndex}][${valueIndex}] must be a string.`);
        }
      });
    });

    return {
      strings,
      variables,
      inputs: { int: intQueues, str: strQueues },
    };
  }

  function operandLabel(operand) {
    return `${operand.kind}[${operand.value}] from ${operand.token.text}`;
  }

  function programAstTree(program) {
    const root = createTreeNode(`Program (${program.instructions.length} instruction(s))`);
    const labelsNode = createTreeNode("labels");
    const labelEntries = Object.entries(program.labels).sort((a, b) => Number(a[0]) - Number(b[0]));
    if (!labelEntries.length) {
      labelsNode.children.push(createTreeNode("(none)"));
    } else {
      labelEntries.forEach(([labelId, target]) => {
        labelsNode.children.push(createTreeNode(`label[${labelId}] -> instruction[${target}]`));
      });
    }
    const instructionsNode = createTreeNode("instructions");
    program.instructions.forEach((instruction, index) => {
      const operandText = instruction.operands.length
        ? ` (${instruction.operands.map(operandLabel).join(", ")})`
        : "";
      const node = createTreeNode(`[${index}] ${instruction.opcode.mnemonic} @ line ${instruction.line}${operandText}`);
      node.children.push(createTreeNode(`source: ${instruction.sourceRow}`));
      if (!instruction.operands.length) {
        node.children.push(createTreeNode("operands: (none)"));
      }
      instructionsNode.children.push(node);
    });
    root.children.push(labelsNode, instructionsNode);
    return renderTree(root);
  }

  class ExecutionTrace {
    constructor() {
      this.root = createTreeNode("Execution");
      this.contextStack = [this.root];
    }

    startStep(step, ip, instruction) {
      const operandText = instruction.operands.length
        ? ` (${instruction.operands.map(operandLabel).join(", ")})`
        : "";
      const node = createTreeNode(`[step ${step}] [ip=${ip}] ${instruction.opcode.mnemonic}${operandText} @ line ${instruction.line}`);
      this.contextStack[this.contextStack.length - 1].children.push(node);
      return node;
    }

    finishStep(node, { stack, variables, outputDelta, branchNote = null, callContextLabel = null, popContext = false, errorMessage = null }) {
      if (branchNote) {
        node.children.push(createTreeNode(`branch: ${branchNote}`));
      }
      if (outputDelta) {
        node.children.push(createTreeNode(`output += ${shortRepr(outputDelta)}`));
      }
      if (errorMessage) {
        node.children.push(createTreeNode(`error: ${errorMessage}`));
      }
      node.children.push(createTreeNode(`state: stack=${summarizeSequence(stack)} vars=${summarizeSequence(variables)}`));
      if (callContextLabel) {
        const contextNode = createTreeNode(callContextLabel);
        node.children.push(contextNode);
        this.contextStack.push(contextNode);
      }
      if (popContext && this.contextStack.length > 1) {
        this.contextStack.pop();
      }
    }

    render(steps, halted, finalOutput) {
      this.root.children.push(createTreeNode(`summary: steps=${steps} halted=${halted ? "yes" : "no"} output=${shortRepr(finalOutput)}`));
      return renderTree(this.root);
    }
  }

  class VirtualMachine {
    constructor(program, sidecar, options = {}) {
      this.program = program;
      this.strings = sidecar.strings.slice();
      this.variables = sidecar.variables.slice();
      this.intInputs = sidecar.inputs.int.map((queue) => queue.slice());
      this.strInputs = sidecar.inputs.str.map((queue) => queue.slice());
      this.stack = [];
      this.callStack = [];
      this.outputParts = [];
      this.ip = 0;
      this.steps = 0;
      this.halted = false;
      this.stepLimit = options.stepLimit ?? 50000;
      this.astTree = programAstTree(program);
      this.trace = new ExecutionTrace();
      this.events = [];
    }

    run() {
      while (this.ip >= 0 && this.ip < this.program.instructions.length) {
        if (this.steps >= this.stepLimit) {
          throw new MnmError(`Execution exceeded step limit of ${this.stepLimit}.`);
        }
        const instruction = this.program.instructions[this.ip];
        this.steps += 1;
        this.executeInstruction(instruction);
        if (this.halted) {
          break;
        }
      }
      return {
        output: this.outputParts.join(""),
        steps: this.steps,
        halted: this.halted,
        finalStack: this.stack.slice(),
        finalVariables: this.variables.slice(),
        astTree: this.astTree,
        traceTree: this.trace.render(this.steps, this.halted, this.outputParts.join("")),
        canonicalSource: this.program.canonicalSource,
        events: this.events.slice(),
      };
    }

    executeInstruction(instruction) {
      const startIp = this.ip;
      const outputCountBefore = this.outputParts.length;
      const traceNode = this.trace.startStep(this.steps, startIp, instruction);
      const handler = this[`op_${instruction.opcode.mnemonic.toLowerCase()}`];
      if (typeof handler !== "function") {
        throw new MnmError(`Opcode ${instruction.opcode.mnemonic} is not implemented.`, instruction.line);
      }
      try {
        handler.call(this, ...instruction.operands.map((operand) => operand.value), instruction.line);
      } catch (error) {
        const message = error instanceof MnmError ? error.toString() : String(error);
        this.trace.finishStep(traceNode, {
          stack: this.stack.slice(),
          variables: this.variables.slice(),
          outputDelta: this.outputParts.slice(outputCountBefore).join(""),
          errorMessage: message,
        });
        throw error;
      }
      const transition = this.traceTransition(instruction, startIp);
      const outputDelta = this.outputParts.slice(outputCountBefore).join("");
      this.trace.finishStep(traceNode, {
        stack: this.stack.slice(),
        variables: this.variables.slice(),
        outputDelta,
        branchNote: transition.branchNote,
        callContextLabel: transition.callContextLabel,
        popContext: transition.popContext,
      });
      this.events.push({
        step: this.steps,
        ip: startIp,
        line: instruction.line,
        sourceRow: instruction.sourceRow,
        mnemonic: instruction.opcode.mnemonic,
        branchNote: transition.branchNote,
        outputDelta,
        stack: this.stack.slice(),
        variables: this.variables.slice(),
      });
    }

    traceTransition(instruction, startIp) {
      const mnemonic = instruction.opcode.mnemonic;
      if (mnemonic === "CALL") {
        const labelId = instruction.operands[0].value;
        return {
          branchNote: `call -> label[${labelId}] @ instruction[${this.ip}]`,
          callContextLabel: `call frame label[${labelId}] @ instruction[${this.ip}]`,
          popContext: false,
        };
      }
      if (mnemonic === "RET") {
        return { branchNote: `return -> instruction[${this.ip}]`, callContextLabel: null, popContext: true };
      }
      if (mnemonic === "JMP") {
        const labelId = instruction.operands[0].value;
        return { branchNote: `jump -> label[${labelId}] @ instruction[${this.ip}]`, callContextLabel: null, popContext: false };
      }
      if (mnemonic === "JZ" || mnemonic === "JNZ") {
        const labelId = instruction.operands[0].value;
        const taken = this.ip !== startIp + 1;
        return {
          branchNote: taken ? `taken -> label[${labelId}] @ instruction[${this.ip}]` : `fallthrough -> instruction[${this.ip}]`,
          callContextLabel: null,
          popContext: false,
        };
      }
      if (mnemonic === "HALT") {
        return { branchNote: "halt", callContextLabel: null, popContext: false };
      }
      if (mnemonic === "LABEL") {
        const labelId = instruction.operands[0].value;
        return { branchNote: `visit label[${labelId}] -> instruction[${this.ip}]`, callContextLabel: null, popContext: false };
      }
      return { branchNote: null, callContextLabel: null, popContext: false };
    }

    pop(line) {
      if (!this.stack.length) {
        throw new MnmError("Stack underflow.", line);
      }
      return this.stack.pop();
    }

    popTwo(line) {
      const right = this.pop(line);
      const left = this.pop(line);
      return [left, right];
    }

    popThree(line) {
      const c = this.pop(line);
      const b = this.pop(line);
      const a = this.pop(line);
      return [a, b, c];
    }

    ensureInt(value, line) {
      if (!Number.isInteger(value)) {
        throw new MnmError(`Expected integer, got ${typeof value}.`, line);
      }
      return value;
    }

    ensureVariableIndex(index, line) {
      if (index < 0 || index >= this.variables.length) {
        throw new MnmError(`Variable slot ${index} does not exist. Seed it in the sidecar first.`, line);
      }
    }

    ensureStringIndex(index, line) {
      if (index < 0 || index >= this.strings.length) {
        throw new MnmError(`String slot ${index} does not exist.`, line);
      }
    }

    truthy(value) {
      return Boolean(value);
    }

    jump(labelId, line) {
      if (!(labelId in this.program.labels)) {
        throw new MnmError(`Label ${labelId} does not exist.`, line);
      }
      this.ip = this.program.labels[labelId];
    }

    op_label(labelId) {
      void labelId;
      this.ip += 1;
    }

    op_jmp(labelId, line) {
      this.jump(labelId, line);
    }

    op_jz(labelId, line) {
      const condition = this.pop(line);
      if (!this.truthy(condition)) {
        this.jump(labelId, line);
      } else {
        this.ip += 1;
      }
    }

    op_jnz(labelId, line) {
      const condition = this.pop(line);
      if (this.truthy(condition)) {
        this.jump(labelId, line);
      } else {
        this.ip += 1;
      }
    }

    op_call(labelId, line) {
      this.callStack.push(this.ip + 1);
      this.jump(labelId, line);
    }

    op_ret(line) {
      if (!this.callStack.length) {
        throw new MnmError("RET was executed with an empty call stack.", line);
      }
      this.ip = this.callStack.pop();
    }

    op_halt() {
      this.halted = true;
    }

    op_push(literal) {
      this.stack.push(literal);
      this.ip += 1;
    }

    op_load(index, line) {
      this.ensureVariableIndex(index, line);
      this.stack.push(this.variables[index]);
      this.ip += 1;
    }

    op_store(index, line) {
      this.ensureVariableIndex(index, line);
      this.variables[index] = this.pop(line);
      this.ip += 1;
    }

    op_dup(line) {
      const value = this.pop(line);
      this.stack.push(value, value);
      this.ip += 1;
    }

    op_pop(line) {
      this.pop(line);
      this.ip += 1;
    }

    op_inc(index, line) {
      this.ensureVariableIndex(index, line);
      this.variables[index] = this.ensureInt(this.variables[index], line) + 1;
      this.ip += 1;
    }

    op_dec(index, line) {
      this.ensureVariableIndex(index, line);
      this.variables[index] = this.ensureInt(this.variables[index], line) - 1;
      this.ip += 1;
    }

    binaryInt(operator, line) {
      const [left, right] = this.popTwo(line);
      return operator(this.ensureInt(left, line), this.ensureInt(right, line));
    }

    op_add(line) {
      this.stack.push(this.binaryInt((a, b) => a + b, line));
      this.ip += 1;
    }

    op_sub(line) {
      this.stack.push(this.binaryInt((a, b) => a - b, line));
      this.ip += 1;
    }

    op_mul(line) {
      this.stack.push(this.binaryInt((a, b) => a * b, line));
      this.ip += 1;
    }

    op_div(line) {
      const [left, right] = this.popTwo(line);
      const leftValue = this.ensureInt(left, line);
      const rightValue = this.ensureInt(right, line);
      if (rightValue === 0) {
        throw new MnmError("Division by zero.", line);
      }
      this.stack.push(Math.trunc(leftValue / rightValue));
      this.ip += 1;
    }

    op_mod(line) {
      const [left, right] = this.popTwo(line);
      const leftValue = this.ensureInt(left, line);
      const rightValue = this.ensureInt(right, line);
      if (rightValue === 0) {
        throw new MnmError("Modulo by zero.", line);
      }
      this.stack.push(leftValue % rightValue);
      this.ip += 1;
    }

    op_eq(line) {
      const [left, right] = this.popTwo(line);
      this.stack.push(left === right ? 1 : 0);
      this.ip += 1;
    }

    op_lt(line) {
      const [left, right] = this.popTwo(line);
      this.stack.push(this.ensureInt(left, line) < this.ensureInt(right, line) ? 1 : 0);
      this.ip += 1;
    }

    op_gt(line) {
      const [left, right] = this.popTwo(line);
      this.stack.push(this.ensureInt(left, line) > this.ensureInt(right, line) ? 1 : 0);
      this.ip += 1;
    }

    op_print(line) {
      this.outputParts.push(String(this.pop(line)));
      this.ip += 1;
    }

    op_print_str(index, line) {
      this.ensureStringIndex(index, line);
      this.outputParts.push(this.strings[index]);
      this.ip += 1;
    }

    op_read_int(index, line) {
      if (index >= this.intInputs.length) {
        throw new MnmError(`Integer input queue ${index} does not exist.`, line);
      }
      if (!this.intInputs[index].length) {
        throw new MnmError(`Integer input queue ${index} is empty.`, line);
      }
      this.stack.push(this.intInputs[index].shift());
      this.ip += 1;
    }

    op_read_str(index, line) {
      if (index >= this.strInputs.length) {
        throw new MnmError(`String input queue ${index} does not exist.`, line);
      }
      if (!this.strInputs[index].length) {
        throw new MnmError(`String input queue ${index} is empty.`, line);
      }
      this.stack.push(this.strInputs[index].shift());
      this.ip += 1;
    }

    op_emit_char(line) {
      const value = this.ensureInt(this.pop(line), line);
      this.outputParts.push(String.fromCodePoint(value));
      this.ip += 1;
    }

    op_newline() {
      this.outputParts.push("\n");
      this.ip += 1;
    }

    op_push_str(index, line) {
      this.ensureStringIndex(index, line);
      this.stack.push(this.strings[index]);
      this.ip += 1;
    }

    op_concat(line) {
      const [left, right] = this.popTwo(line);
      this.stack.push(`${left}${right}`);
      this.ip += 1;
    }

    op_len(line) {
      this.stack.push(String(this.pop(line)).length);
      this.ip += 1;
    }

    op_to_int(line) {
      const value = this.pop(line);
      const converted = Number.parseInt(String(value).trim(), 10);
      if (!Number.isFinite(converted)) {
        throw new MnmError(`Could not convert ${shortRepr(value)} to int.`, line);
      }
      this.stack.push(converted);
      this.ip += 1;
    }

    op_to_str(line) {
      this.stack.push(String(this.pop(line)));
      this.ip += 1;
    }

    op_swap(line) {
      const [left, right] = this.popTwo(line);
      this.stack.push(right, left);
      this.ip += 1;
    }

    op_rot(line) {
      const [first, second, third] = this.popThree(line);
      this.stack.push(second, third, first);
      this.ip += 1;
    }

    op_and(line) {
      const [left, right] = this.popTwo(line);
      this.stack.push(this.truthy(left) && this.truthy(right) ? 1 : 0);
      this.ip += 1;
    }

    op_or(line) {
      const [left, right] = this.popTwo(line);
      this.stack.push(this.truthy(left) || this.truthy(right) ? 1 : 0);
      this.ip += 1;
    }

    op_not(line) {
      this.stack.push(!this.truthy(this.pop(line)) ? 1 : 0);
      this.ip += 1;
    }
  }

  function runSource(source, sidecar, options = {}) {
    const program = parseSource(source);
    const normalizedSidecar = normalizeSidecar(sidecar);
    const vm = new VirtualMachine(program, normalizedSidecar, options);
    return vm.run();
  }

  function drawCandy(ctx, x, y, size, colorKey) {
    const [r, g, b] = COLOR_RGB[colorKey];
    const radius = size / 2;
    ctx.save();
    ctx.translate(x + radius, y + radius);
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.26)`;
    ctx.beginPath();
    ctx.ellipse(0, radius * 0.8, radius * 0.86, radius * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();

    const shell = ctx.createRadialGradient(-radius * 0.28, -radius * 0.32, radius * 0.1, 0, 0, radius);
    shell.addColorStop(0, `rgba(${Math.min(255, r + 45)}, ${Math.min(255, g + 45)}, ${Math.min(255, b + 45)}, 1)`);
    shell.addColorStop(0.48, `rgba(${r}, ${g}, ${b}, 1)`);
    shell.addColorStop(1, `rgba(${Math.max(0, r - 46)}, ${Math.max(0, g - 46)}, ${Math.max(0, b - 46)}, 1)`);
    ctx.fillStyle = shell;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.88, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.beginPath();
    ctx.ellipse(-radius * 0.2, -radius * 0.28, radius * 0.24, radius * 0.16, -0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function renderProgramToCanvas(canvas, source, options = {}) {
    const { rows, canonicalSource } = parseSource(source);
    const highlightRow = options.highlightRow ?? null;
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const context = canvas.getContext("2d");
    const containerWidth = canvas.parentElement?.clientWidth || canvas.clientWidth || 720;
    const columns = Math.max(...rows.map((row) => row.length));
    const margin = 18;
    const gap = columns > 18 ? 6 : 10;
    const maxWidth = options.maxWidth ?? containerWidth;
    const minCellSize = options.minCellSize ?? 18;
    const maxCellSize = options.maxCellSize ?? 34;
    const availableWidth = Math.min(containerWidth, maxWidth);
    const cellSize = Math.max(
      minCellSize,
      Math.min(maxCellSize, (availableWidth - margin * 2 - gap * (columns - 1)) / columns),
    );
    const width = margin * 2 + columns * cellSize + (columns - 1) * gap;
    const height = margin * 2 + rows.length * cellSize + (rows.length - 1) * gap;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, width, height);

    const paper = context.createLinearGradient(0, 0, 0, height);
    paper.addColorStop(0, "rgba(13,13,13,1)");
    paper.addColorStop(1, "rgba(20,20,20,1)");
    context.fillStyle = paper;
    context.fillRect(0, 0, width, height);

    context.strokeStyle = "rgba(68,68,68,0.28)";
    context.strokeRect(0.5, 0.5, width - 1, height - 1);

    rows.forEach((row, rowIndex) => {
      const y = margin + rowIndex * (cellSize + gap);
      if (highlightRow === rowIndex) {
        context.fillStyle = "rgba(255, 255, 255, 0.06)";
        context.fillRect(margin - 10, y - 6, width - margin * 2 + 20, cellSize + 12);
      }
      for (let columnIndex = 0; columnIndex < row.length; columnIndex += 1) {
        const char = row[columnIndex];
        if (char === " ") {
          continue;
        }
        const x = margin + columnIndex * (cellSize + gap);
        drawCandy(context, x, y, cellSize, char);
      }
    });

    return { width, height, canonicalSource };
  }

  function createElement(tagName, className, textContent = "") {
    const element = document.createElement(tagName);
    if (className) {
      element.className = className;
    }
    if (textContent) {
      element.textContent = textContent;
    }
    return element;
  }

  function readSeedSource(root) {
    const sourceSeed = root.querySelector(".mnm-demo-source");
    return sourceSeed ? sourceSeed.value.trim() : "";
  }

  function readSeedSidecar(root) {
    const sidecarSeed = root.querySelector(".mnm-demo-sidecar");
    if (!sidecarSeed) {
      return null;
    }
    return sidecarSeed.textContent.trim();
  }

  function ensureStyles() {
    if (typeof document === "undefined") {
      return;
    }
    if (document.getElementById("mnm-lang-web-demo-styles")) {
      return;
    }
    const style = document.createElement("style");
    style.id = "mnm-lang-web-demo-styles";
    style.textContent = INJECTED_STYLES;
    document.head.appendChild(style);
  }

  function typewriterAppend(element, text, delay) {
    return new Promise((resolve) => {
      if (!text) {
        resolve();
        return;
      }
      let index = 0;
      function tick() {
        element.textContent += text[index];
        index += 1;
        if (index >= text.length) {
          resolve();
          return;
        }
        window.setTimeout(tick, delay);
      }
      tick();
    });
  }

  function formatPreviewLine(event) {
    const parts = [`[${event.step}] ${event.mnemonic}`];
    if (event.branchNote) {
      parts.push(`=> ${event.branchNote}`);
    }
    if (event.outputDelta) {
      parts.push(`output ${shortRepr(event.outputDelta, 26)}`);
    }
    return parts.join(" | ");
  }

  function sleep(duration) {
    return new Promise((resolve) => window.setTimeout(resolve, duration));
  }

  function buildWidget(root, options = {}) {
    ensureStyles();
    const mode = options.mode || root.dataset.mode || (root.hasAttribute("data-mnm-full-demo") ? "full" : "inline");
    const exampleKey = options.example || root.dataset.example || "hello_world";
    const example = EXAMPLES[exampleKey] || EXAMPLES.hello_world;
    const seedSource = readSeedSource(root) || example.source;
    const seedSidecar = readSeedSidecar(root) || JSON.stringify(example.sidecar, null, 2);

    root.innerHTML = "";
    root.classList.add("mnm-widget");
    root.dataset.mode = mode;

    const headline = createElement("div", "mnm-topline");
    const headlineCopy = createElement("div", "mnm-copy");
    headlineCopy.appendChild(createElement("p", "mnm-kicker", mode === "full" ? "browser-native candy vm" : "inline candy machine"));
    headlineCopy.appendChild(createElement("h2", "mnm-title", mode === "full" ? "MNM Lang workbench" : options.title || "Run this candy code"));
    headlineCopy.appendChild(
      createElement(
        "p",
        "mnm-description",
        mode === "full"
          ? "Edit source and sidecar JSON, render the candy sheet, then inspect output, AST, and trace as the interpreter runs."
          : (options.description || "This widget uses the same in-browser MNM Lang interpreter to render the sheet, run it, and reveal the AST plus execution trace.")
      ),
    );
    headline.appendChild(headlineCopy);
    root.appendChild(headline);

    if (mode === "full") {
      const exampleRow = createElement("div", "mnm-example-row");
      Object.entries(EXAMPLES).forEach(([key, item]) => {
        const chip = createElement("button", "mnm-chip", item.title);
        chip.type = "button";
        chip.dataset.active = key === exampleKey ? "true" : "false";
        chip.addEventListener("click", () => {
          sourceField.value = item.source;
          sidecarField.value = JSON.stringify(item.sidecar, null, 2);
          status.textContent = item.description;
          exampleRow.querySelectorAll(".mnm-chip").forEach((button) => {
            button.dataset.active = button === chip ? "true" : "false";
          });
          refreshCanvas();
          astTree.textContent = "";
          traceTree.textContent = "";
          outputView.textContent = "";
        });
        exampleRow.appendChild(chip);
      });
      root.appendChild(exampleRow);
    }

    const bench = createElement("div", "mnm-workbench");
    const leftColumn = createElement("div", "mnm-column");
    const rightColumn = createElement("div", "mnm-column");

    const sourceSurface = createElement("section", "mnm-surface");
    const sourceHeading = createElement("div", "mnm-surface-heading");
    sourceHeading.appendChild(createElement("h3", "", "Source"));
    sourceSurface.appendChild(sourceHeading);
    const sourceEditorShell = createElement("div", "mnm-editor-shell");
    const sourceBackdrop = createElement("pre", "mnm-editor-backdrop mnm-preview-source");
    const sourceField = createElement("textarea", "mnm-field mnm-source");
    sourceField.spellcheck = false;
    sourceField.value = seedSource;
    sourceEditorShell.append(sourceBackdrop, sourceField);
    sourceSurface.appendChild(sourceEditorShell);

    const sidecarSurface = createElement("section", "mnm-surface");
    const sidecarHeading = createElement("div", "mnm-surface-heading");
    sidecarHeading.appendChild(createElement("h3", "", "Sidecar JSON"));
    sidecarSurface.appendChild(sidecarHeading);
    const sidecarEditorShell = createElement("div", "mnm-editor-shell");
    const sidecarBackdrop = createElement("pre", "mnm-editor-backdrop mnm-preview-json");
    const sidecarField = createElement("textarea", "mnm-field mnm-sidecar");
    sidecarField.spellcheck = false;
    sidecarField.value = formatSidecarJson(seedSidecar);
    sidecarEditorShell.append(sidecarBackdrop, sidecarField);
    sidecarSurface.appendChild(sidecarEditorShell);

    const controlSurface = createElement("section", "mnm-surface");
    const controls = createElement("div", "mnm-controls");
    const renderButton = createElement("button", "mnm-button mnm-button-secondary", "Render");
    renderButton.type = "button";
    const runButton = createElement("button", "mnm-button mnm-button-primary", "Run");
    runButton.type = "button";
    const resetButton = createElement("button", "mnm-button mnm-button-secondary", "Reset");
    resetButton.type = "button";
    controls.append(renderButton, runButton, resetButton);
    const status = createElement("p", "mnm-status", example.description);
    controlSurface.append(controls, status);

    leftColumn.append(sourceSurface, sidecarSurface, controlSurface);

    const renderSurface = createElement("section", "mnm-surface");
    const renderHeading = createElement("div", "mnm-surface-heading");
    renderHeading.appendChild(createElement("h3", "", "Candy Sheet"));
    renderSurface.appendChild(renderHeading);
    const renderStage = createElement("div", "mnm-render-stage");
    const canvas = createElement("canvas", "mnm-render-canvas");
    renderStage.appendChild(canvas);
    renderSurface.appendChild(renderStage);

    const outputSurface = createElement("section", "mnm-surface");
    const outputHeading = createElement("div", "mnm-surface-heading");
    outputHeading.appendChild(createElement("h3", "", "Output"));
    outputSurface.appendChild(outputHeading);
    const outputView = createElement("pre", "mnm-output");
    outputView.textContent = mode === "inline" ? "Press Run to animate the result." : "";
    outputSurface.appendChild(outputView);

    const astDetails = createElement("details", "mnm-detail");
    const astSummary = createElement("summary", "", "AST tree");
    astDetails.appendChild(astSummary);
    const astTree = createElement("pre", "mnm-tree");
    astDetails.appendChild(astTree);

    const traceDetails = createElement("details", "mnm-detail");
    const traceSummary = createElement("summary", "", "Execution trace");
    traceDetails.appendChild(traceSummary);
    const traceTree = createElement("pre", "mnm-tree");
    traceTree.textContent = mode === "inline" ? "Run the program to reveal the trace." : "";
    traceDetails.appendChild(traceTree);

    const triPane = createElement("div", "mnm-tri-pane");
    triPane.append(renderSurface, astDetails, traceDetails);
    rightColumn.append(triPane, outputSurface);
    bench.append(leftColumn, rightColumn);
    root.appendChild(bench);

    function updateSourcePreview(sourceText) {
      sourceBackdrop.innerHTML = highlightMnmSource(sourceText);
    }

    function updateSidecarPreview(sidecarText) {
      try {
        sidecarBackdrop.innerHTML = highlightJsonText(formatSidecarJson(sidecarText));
      } catch (error) {
        sidecarBackdrop.innerHTML = `<span class="mnm-code-error">${escapeHtml(String(sidecarText || ""))}</span>`;
      }
    }

    async function refreshCanvas(highlightRow = null) {
      try {
        const { canonicalSource } = renderProgramToCanvas(canvas, sourceField.value, {
          highlightRow,
          maxCellSize: mode === "full" ? 30 : 24,
          minCellSize: mode === "full" ? 14 : 12,
          maxWidth: mode === "full" ? 560 : 360,
        });
        sourceField.value = canonicalSource;
        updateSourcePreview(canonicalSource);
        return canonicalSource;
      } catch (error) {
        throw error;
      }
    }

    function resetToCurrent() {
      outputView.textContent = mode === "inline" ? "Press Run to animate the result." : "";
      astTree.textContent = "";
      traceTree.textContent = mode === "inline" ? "Run the program to reveal the trace." : "";
      status.textContent = "Ready.";
      updateSidecarPreview(sidecarField.value);
      syncEditorScroll(sourceField, sourceBackdrop);
      syncEditorScroll(sidecarField, sidecarBackdrop);
      refreshCanvas().catch((error) => {
        status.textContent = error.toString();
        status.classList.add("mnm-error");
      });
    }

    async function animateRun() {
      try {
        status.classList.remove("mnm-error");
        status.textContent = "Parsing, rendering, and animating the VM...";
        runButton.disabled = true;
        renderButton.disabled = true;
        resetButton.disabled = true;

        const canonicalSource = await refreshCanvas();
        sidecarField.value = formatSidecarJson(sidecarField.value);
        updateSidecarPreview(sidecarField.value);
        const result = runSource(canonicalSource, sidecarField.value);
        astDetails.open = true;
        traceDetails.open = true;
        astTree.textContent = "";
        outputView.textContent = "";
        traceTree.textContent = "";

        const reducedMotion = typeof window !== "undefined"
          && window.matchMedia
          && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (reducedMotion) {
          astTree.textContent = result.astTree;
          outputView.textContent = result.output;
          traceTree.textContent = result.traceTree;
          await refreshCanvas();
        } else {
          const fastMode = result.events.length > 80;
          const stepDelay = fastMode ? 28 : 74;
          const charDelay = fastMode ? 9 : 18;
          let preview = "";
          astTree.textContent = result.astTree;
          for (const event of result.events) {
            await refreshCanvas(event.ip);
            preview += `${formatPreviewLine(event)}\n`;
            traceTree.textContent = preview.trimEnd();
            if (event.outputDelta) {
              await typewriterAppend(outputView, event.outputDelta, charDelay);
            }
            await sleep(stepDelay);
          }
          traceTree.textContent = result.traceTree;
          await refreshCanvas();
        }
        status.textContent = `Done in ${result.steps} step${result.steps === 1 ? "" : "s"}.`;
      } catch (error) {
        status.textContent = error.toString();
        status.classList.add("mnm-error");
      } finally {
        runButton.disabled = false;
        renderButton.disabled = false;
        resetButton.disabled = false;
      }
    }

    renderButton.addEventListener("click", async () => {
      try {
        status.classList.remove("mnm-error");
        const canonicalSource = await refreshCanvas();
        sidecarField.value = formatSidecarJson(sidecarField.value);
        updateSidecarPreview(sidecarField.value);
        const parsed = parseSource(canonicalSource);
        astDetails.open = true;
        astTree.textContent = programAstTree(parsed);
        status.textContent = "Candy sheet updated.";
      } catch (error) {
        status.textContent = error.toString();
        status.classList.add("mnm-error");
      }
    });

    sourceField.addEventListener("input", () => {
      updateSourcePreview(sourceField.value);
    });
    sourceField.addEventListener("scroll", () => {
      syncEditorScroll(sourceField, sourceBackdrop);
    });
    sidecarField.addEventListener("input", () => {
      updateSidecarPreview(sidecarField.value);
    });
    sidecarField.addEventListener("scroll", () => {
      syncEditorScroll(sidecarField, sidecarBackdrop);
    });
    sidecarField.addEventListener("blur", () => {
      try {
        sidecarField.value = formatSidecarJson(sidecarField.value);
        updateSidecarPreview(sidecarField.value);
      } catch (error) {
        status.textContent = error.toString();
        status.classList.add("mnm-error");
      }
    });

    runButton.addEventListener("click", animateRun);
    resetButton.addEventListener("click", () => {
      sourceField.value = seedSource;
      sidecarField.value = seedSidecar;
      resetToCurrent();
    });

    let resizeRaf = 0;
    const handleResponsiveRefresh = () => {
      if (resizeRaf) {
        cancelAnimationFrame(resizeRaf);
      }
      resizeRaf = requestAnimationFrame(() => {
        refreshCanvas().catch(() => {});
        syncEditorScroll(sourceField, sourceBackdrop);
        syncEditorScroll(sidecarField, sidecarBackdrop);
      });
    };

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => {
        handleResponsiveRefresh();
      });
      observer.observe(root);
    } else if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResponsiveRefresh, { passive: true });
    }

    refreshCanvas().then(() => {
      try {
        updateSidecarPreview(sidecarField.value);
        syncEditorScroll(sourceField, sourceBackdrop);
        syncEditorScroll(sidecarField, sidecarBackdrop);
        astTree.textContent = programAstTree(parseSource(sourceField.value));
      } catch (error) {
        astTree.textContent = error.toString();
      }
    });
  }

  function autoMount() {
    if (typeof document === "undefined") {
      return;
    }
    document.querySelectorAll("[data-mnm-inline-demo], [data-mnm-full-demo]").forEach((root) => {
      if (root.dataset.mnmMounted === "true") {
        return;
      }
      root.dataset.mnmMounted = "true";
      buildWidget(root, {
        mode: root.hasAttribute("data-mnm-full-demo") ? "full" : "inline",
        title: root.dataset.title || "",
        description: root.dataset.description || "",
        example: root.dataset.example || undefined,
      });
    });
  }

  const api = {
    examples: EXAMPLES,
    parseSource,
    normalizeSidecar,
    runSource,
    renderProgramToCanvas,
    mount: buildWidget,
    autoMount,
  };

  globalThis.MnmLangWebDemo = api;

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", autoMount, { once: true });
    } else {
      autoMount();
    }
  }
})();
