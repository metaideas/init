import app from "~/routes"

export default {
  fetch: app.fetch,
} satisfies ExportedHandler<Env>
