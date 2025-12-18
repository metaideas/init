import { Button } from "@init/ui/components/button"
import { Icon } from "@init/ui/components/icon"
import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { UNAUTHENTICATED_PATHNAME } from "#features/auth/constants.ts"
import { signOut } from "#shared/auth.ts"

export default function SignOutButton() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  return (
    <Button
      disabled={loading}
      onClick={() => {
        setLoading(true)

        signOut({
          fetchOptions: {
            onSuccess: () => {
              void navigate({ to: UNAUTHENTICATED_PATHNAME })
            },
            onError: () => {
              setLoading(false)
            },
          },
        })
      }}
      variant="secondary"
    >
      {loading ? (
        <>
          <Icon.Loader className="mr-2 h-4 w-4 animate-spin" />
          Signing out...
        </>
      ) : (
        "Sign out"
      )}
    </Button>
  )
}
