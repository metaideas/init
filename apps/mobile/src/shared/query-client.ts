import AsyncStorage from "@react-native-async-storage/async-storage"
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister"
import { QueryClient } from "@tanstack/react-query"
import superjson from "superjson"

export const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      // Queue mutations when offline
      networkMode: "offlineFirst",
    },
    queries: {
      // Use cached data while offline
      networkMode: "offlineFirst",
    },
  },
})

export const persister = createAsyncStoragePersister({
  deserialize: (data) => superjson.parse(data),
  serialize: (data) => superjson.stringify(data),
  storage: AsyncStorage,
})
