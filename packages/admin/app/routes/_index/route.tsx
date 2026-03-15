import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  // For embedded apps, Shopify always loads /app with id_token.
  // If someone hits the root without a shop param, redirect to /app.
  throw redirect("/app");
};

export default function Index() {
  return null;
}
