import { access } from "npm:lizod@0.2.6";

export function makeValidateError(
  input: unknown,
  ctx: { errors: (string | number)[][] },
): Error {
  return new ValidateError(input, ctx.errors);
}

class ValidateError extends Error {
  constructor(input: unknown, errors: (string | number)[][], cause?: unknown) {
    const e = errors
      .map((e) =>
        `Error at: ${JSON.stringify(e)}. actual: ${
          JSON.stringify(access(input, e))
        }`
      )
      .join("\n");
    super(e, { cause });
  }
}
