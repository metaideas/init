import { type AnyColumn, sql } from "drizzle-orm"

export function increment(column: AnyColumn, value = 1) {
  return sql`${column} + ${value}`
}

export function decrement(column: AnyColumn, value = 1) {
  return sql`${column} - ${value}`
}

export function checkIsLocalDatabase(url: string) {
  return url.includes("localhost") || url.includes("127.0.0.1")
}

export * from "drizzle-orm/sql"
