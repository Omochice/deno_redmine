import { errAsync, okAsync, ResultAsync } from "npm:neverthrow@6.1.0";
import { join } from "https://deno.land/std@0.205.0/url/join.ts";
import type { Context } from "../context.ts";
import { convertError } from "../error.ts";

export function deleteTimeEntry(
  id: number,
  context: Context,
): ResultAsync<undefined, Error> {
  return ResultAsync.fromPromise(
    fetch(join(context.endpoint, "time_entries", `${id}.json`), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": context.apiKey,
      },
    }),
    convertError("Unexpected Error"),
  )
    .andThen((r: Response) => r.ok ? okAsync(undefined) : errAsync(r))
    .orElse((e: Response | Error) => {
      if (e instanceof Error) {
        return errAsync(e);
      }
      return errAsync(new Error(`Error: ${e.status}`, { cause: e }));
    });
}
