import { useEffect } from "react"

export function useIdentifyUser(client: IdentifyClient, user: AnalyticsUser) {
  useEffect(() => {
    client.identify(user.id, { email: user.email })
  }, [client, user.id, user.email])
}

export type AnalyticsUser = { id: string; email: string }

type IdentifyClient = {
  identify: (id: string, properties: { email: string }) => void
}
