import { errAsync, okAsync, ResultAsync } from "npm:neverthrow@6.1.0";
import { is, object, parse } from "https://deno.land/x/valibot@v0.18.0/mod.ts";
import { join } from "https://deno.land/std@0.205.0/url/join.ts";
import type { Context } from "../context.ts";
import { TimeEntry, timeEntry } from "./type.ts";
import { convertError } from "../error.ts";

const schema = object({
  time_entry: timeEntry,
});

export function show(
  id: number,
  context: Context,
): ResultAsync<TimeEntry, Error> {
  return ResultAsync.fromPromise(
    fetch(join(context.endpoint, "time_entries", `${id}.json`), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": context.apiKey,
      },
    }),
    convertError("Unexpected Error"),
  )
    .andThen((r: Response) => r.ok ? okAsync(r) : errAsync(r))
    .andThen((r: Response) =>
      ResultAsync.fromPromise(r.json(), convertError("convert Error"))
    )
    .andThen((json: unknown) => {
      if (is(schema, json)) {
        return okAsync(parse(schema, json).time_entry);
      }
      return errAsync(new Error("foo"));
    })
    .orElse((e: Response | Error) => {
      if (e instanceof Error) {
        return errAsync(e);
      }
      return errAsync(new Error(`Error: ${e.status}`, { cause: e }));
    });
}
