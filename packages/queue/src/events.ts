import { EventSchemas } from "inngest"

type Events = {
  "test/helloWorld": { data: { id: string } }
}

export const schemas = new EventSchemas().fromRecord<Events>()
