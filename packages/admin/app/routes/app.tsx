import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { Outlet, useLoaderData, useNavigate } from "react-router";
import { useEffect } from "react";

import { authenticate } from "../auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate(request);

  return { session, apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  useEffect(() => {
    const handleNavigate = (event: Event) => {
      const href = (event.target as Element)?.getAttribute("href");
      if (href) {
        navigate(href);
      }
    };
    document.addEventListener("shopify:navigate", handleNavigate);
    return () => {
      document.removeEventListener("shopify:navigate", handleNavigate);
    };
  }, [navigate]);

  return (
    <>
      <script
        src="https://cdn.shopify.com/shopifycloud/app-bridge.js"
        data-api-key={apiKey}
      />
      <script src="https://cdn.shopify.com/shopifycloud/polaris.js" />
      <s-app-nav>
        <s-link href="/app">Home</s-link>
        <s-link href="/app/additional">Additional page</s-link>
      </s-app-nav>
      <Outlet />
    </>
  );
}

export const headers: HeadersFunction = ({ loaderHeaders }) => {
  return loaderHeaders;
};
