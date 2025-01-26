"use client"

import { Button } from "@this/ui/components/button"
import { Loader2Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { authClient } from "~/lib/auth/client"
import { UNAUTHORIZED_PATHNAME } from "~/lib/constants"

export default function SignOutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  return (
    <Button
      variant="secondary"
      onClick={() => {
        setLoading(true)
        authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              router.push(UNAUTHORIZED_PATHNAME)
            },
          },
        })
      }}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
          Signing out...
        </>
      ) : (
        "Sign out"
      )}
    </Button>
  )
}
