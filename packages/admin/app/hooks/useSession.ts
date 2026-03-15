import { useRouteLoaderData } from "react-router";
import type { loader as appLoader } from "../routes/app";

export function useSession() {
  const data = useRouteLoaderData<typeof appLoader>("routes/app");

  if (!data) {
    throw new Error("useSession must be used within the app route");
  }

  return data;
}
