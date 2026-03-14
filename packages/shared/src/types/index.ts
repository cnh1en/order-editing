export type { paths, operations, components } from "./generated";
import type { operations, components } from "./generated";

// Shared types
export type ValidationError =
  components["responses"]["ValidationException"]["content"]["application/json"];

// Order types
export type Order =
  operations["orderEdit.show"]["responses"][200]["content"]["application/json"]["data"];

export type OrderLineItem = Order["line_items"][number];

export type BeginOrderEditPayload =
  components["schemas"]["BeginOrderEditRequest"];

export type CalculatedOrder =
  operations["orderEdit.begin"]["responses"][200]["content"]["application/json"]["data"];

export type CommitOrderEditPayload =
  components["schemas"]["CommitOrderEditRequest"];
