import { useState } from "react"

export function useSkeletonWidth() {
  // Random width between 50 to 90%.
  // oxlint-disable-next-line react/hook-use-state -- The width is chosen once per mount and never updated.
  const [width] = useState(() => `${Math.floor(Math.random() * 40) + 50}%`)

  return width
}
