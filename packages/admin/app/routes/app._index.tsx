import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { authenticate } from "../auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate(request);

  return {
    shop: session.shop,
  };
};

export default function Index() {
  const { shop } = useLoaderData<typeof loader>();

  return (
    <s-page heading="Order Editing">
      <s-section heading={`Connected to ${shop}`}>
        <s-paragraph>
          This app allows you to edit Shopify orders. The backend API handles
          all business logic and Shopify GraphQL mutations.
        </s-paragraph>
      </s-section>

      <s-section slot="aside" heading="Architecture">
        <s-paragraph>
          <s-text>Frontend: </s-text>
          <s-link href="https://reactrouter.com/" target="_blank">
            React Router v7 (SSR)
          </s-link>
        </s-paragraph>
        <s-paragraph>
          <s-text>Backend: </s-text>
          Laravel 12 (DDD + Actions)
        </s-paragraph>
        <s-paragraph>
          <s-text>Session: </s-text>
          JWT-based auth via Laravel API
        </s-paragraph>
      </s-section>

      <s-section slot="aside" heading="Next steps">
        <s-unordered-list>
          <s-list-item>
            Build an{" "}
            <s-link
              href="https://shopify.dev/docs/apps/getting-started/build-app-example"
              target="_blank"
            >
              example app
            </s-link>
          </s-list-item>
          <s-list-item>
            Explore Shopify&apos;s API with{" "}
            <s-link
              href="https://shopify.dev/docs/apps/tools/graphiql-admin-api"
              target="_blank"
            >
              GraphiQL
            </s-link>
          </s-list-item>
        </s-unordered-list>
      </s-section>
    </s-page>
  );
}
