import type { Context } from "./context.ts";
import { Client as Issue } from "./issues/mod.ts";
import { Client as Project } from "./projects/mod.ts";
import { Client as Tracker } from "./trackers/mod.ts";

export class Redmine {
  readonly #context: Context;
  readonly issue: Issue;
  readonly project: Project;
  readonly tracker: Tracker;

  constructor(context: Context) {
    this.#context = context;
    this.issue = new Issue(this.#context);
    this.project = new Project(this.#context);
    this.tracker = new Tracker(this.#context);
  }
}
