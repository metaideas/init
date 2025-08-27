import AsyncStorage from "@react-native-async-storage/async-storage"
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister"
import { QueryClient } from "@tanstack/react-query"
import superjson from "superjson"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Use cached data while offline
      networkMode: "offlineFirst",
    },
    mutations: {
      // Queue mutations when offline
      networkMode: "offlineFirst",
    },
  },
})

export const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  serialize: (data) => superjson.stringify(data),
  deserialize: (data) => superjson.parse(data),
})