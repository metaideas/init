import { z } from "zod"

export const parseStringToBoolean = z.preprocess(
  val => val === "true" || val === "1",
  z.boolean()
)
