/* The Clean Up engine, shared by every /pluckit/ page.
   This is a direct port of PluckIt/TextTransformation.swift and the TextStats
   struct in ContentView.swift — same order, same labels, same regexes — so the
   demo on the site does exactly what the menu in the app does. When the Swift
   changes, change it here too.

   Pure logic only: no DOM. Each design owns its own markup and drives a
   CleanUpSession, which keeps the text, the undo stack and the pristine
   extraction the way the app's UndoManager does. */

export const TRANSFORMS = Object.freeze([
  {
    id: "joinLines",
    label: "Join Lines",
    help: "Replace line breaks with a single space",
    source: String.raw`[ \t]*\n[ \t]*  →  " "`,
    apply: (t) => t.replace(/[ \t]*\n[ \t]*/g, " "),
  },
  {
    id: "joinHyphenatedLineBreaks",
    label: "Join Hyphenated Line Breaks",
    help: "Rejoin words split across lines, e.g. “exam-” / “ple” becomes “example”",
    source: String.raw`(\p{L})-\n(\p{L})  →  $1$2`,
    apply: (t) => t.replace(/(\p{L})-\n(\p{L})/gu, "$1$2"),
  },
  {
    id: "removeNewlines",
    label: "Remove Newlines",
    help: "Delete line breaks without adding spaces",
    source: String.raw`\n  →  ""`,
    apply: (t) => t.replaceAll("\n", ""),
  },
  {
    id: "removeSpaces",
    label: "Remove Spaces",
    help: "Delete all spaces and tabs",
    source: String.raw`[ \t]  →  ""`,
    apply: (t) => t.replace(/[ \t]/g, ""),
  },
  {
    id: "collapseSpaces",
    label: "Collapse Spaces",
    help: "Reduce runs of spaces and tabs to a single space",
    source: String.raw`[ \t]{2,}  →  " "`,
    apply: (t) => t.replace(/[ \t]{2,}/g, " "),
  },
  {
    id: "trimLines",
    label: "Trim Line Whitespace",
    help: "Remove leading and trailing whitespace from every line",
    source: String.raw`^[ \t]+ | [ \t]+$  (per line)`,
    apply: (t) => t.split("\n").map((line) => line.trim()).join("\n"),
  },
  {
    id: "removeEmptyLines",
    label: "Remove Empty Lines",
    help: "Delete blank lines",
    source: String.raw`\n(?:[ \t]*\n)+  →  "\n"`,
    apply: (t) => t.replace(/\n(?:[ \t]*\n)+/g, "\n"),
  },
]);

/* Stand-in for a real extraction. Every flaw here is one Vision actually
   produces — a word split across a line break, a paragraph arriving as one
   fragment per line, runs of spaces where the layout had columns, indents
   carried over from the page — so each menu item visibly does something. */
export const SAMPLE = `Vision hands back every recog-
nized fragment on its own line, so
one paragraph  arrives   broken
   across    the page.

Clean Up puts it back together,
and every step is undoable.`;

/** Live counts for a block of text, matching TextStats in ContentView.swift. */
export function stats(text) {
  const characters = [...text].length;
  const words = text.split(/\s+/).filter(Boolean).length;
  const lines = text === "" ? 0 : text.split("\n").length;
  return { characters, words, lines };
}

const plural = (n, singular) => `${n.toLocaleString()} ${n === 1 ? singular : singular + "s"}`;

/** "128 characters · 24 words · 6 lines" */
export function summary(text) {
  const { characters, words, lines } = stats(text);
  return [plural(characters, "character"), plural(words, "word"), plural(lines, "line")].join(" · ");
}

/**
 * The text being cleaned up, its undo stack, and the untouched extraction the
 * app keeps one click away. Designs subscribe with onChange and render however
 * they like; nothing in here touches the document.
 */
export class CleanUpSession {
  #listeners = new Set();

  constructor(text = SAMPLE) {
    this.original = text;
    this.text = text;
    this.past = [];
  }

  onChange(listener) {
    this.#listeners.add(listener);
    listener(this);
    return () => this.#listeners.delete(listener);
  }

  get canUndo() {
    return this.past.length > 0;
  }

  get isDirty() {
    return this.text !== this.original;
  }

  /** The label the app would show under Edit ▸ Undo, or null when there is nothing to undo. */
  get undoActionName() {
    return this.past.at(-1)?.actionName ?? null;
  }

  /** Applies a transformation by id. No-ops when the text is already clean. */
  apply(id) {
    const transform = TRANSFORMS.find((t) => t.id === id);
    if (!transform) return false;
    return this.#replace(transform.apply(this.text), transform.label);
  }

  /** Free-typed edits from a textarea: recorded so they can be undone too. */
  edit(text) {
    return this.#replace(text, "Edit");
  }

  undo() {
    const previous = this.past.pop();
    if (!previous) return false;
    this.text = previous.text;
    this.#emit();
    return true;
  }

  restore() {
    return this.#replace(this.original, "Restore Original Text");
  }

  /** Loads a fresh extraction, discarding the history the old one accumulated. */
  reset(text = this.original) {
    this.original = text;
    this.text = text;
    this.past = [];
    this.#emit();
  }

  #replace(text, actionName) {
    if (text === this.text) return false;
    this.past.push({ text: this.text, actionName });
    this.text = text;
    this.#emit();
    return true;
  }

  #emit() {
    this.#listeners.forEach((listener) => listener(this));
  }
}
