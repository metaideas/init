"use client"

import { Loader2Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@init/ui/components/button"

import { signOut } from "~/shared/auth/client"
import { UNAUTHORIZED_PATHNAME } from "~/shared/constants"

export default function SignOutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  return (
    <Button
      variant="secondary"
      onClick={() => {
        setLoading(true)

        signOut({
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
