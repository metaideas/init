import { Button } from "@init/ui/components/button"
import { useNavigate } from "@tanstack/react-router"
import { Loader2Icon } from "lucide-react"
import { useState } from "react"
import { UNAUTHENTICATED_PATHNAME } from "~/features/auth/constants"
import { signOut } from "~/shared/auth/client"

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
          <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
          Signing out...
        </>
      ) : (
        "Sign out"
      )}
    </Button>
  )
}
