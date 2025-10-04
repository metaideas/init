import { Button } from "@init/ui/components/button"
import { Icon } from "@init/ui/components/icon"
import { toast } from "@init/ui/components/sonner"
import { cn } from "@init/utils/ui"
import { useState } from "react"
import { AUTHENTICATED_PATHNAME } from "~/features/auth/constants"
import { signIn } from "~/shared/auth/client"

export function SignInWithGoogleButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false)

  return (
    <Button
      className={cn("flex gap-3", className)}
      disabled={loading}
      onClick={() => {
        setLoading(true)

        signIn.social({
          callbackURL: AUTHENTICATED_PATHNAME,
          provider: "google",
          fetchOptions: {
            onError() {
              setLoading(false)
              toast.error("Failed to sign in with Google")
            },
          },
        })
      }}
      variant="outline"
    >
      {loading ? (
        <>
          <Icon.Loader className="mr-2 h-4 w-4 animate-spin" />
          Signing in...
        </>
      ) : (
        <>
          <Icon.Google />
          Google
        </>
      )}
    </Button>
  )
}

export function SignInWithGitHubButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false)

  return (
    <Button
      className={cn("flex gap-3", className)}
      disabled={loading}
      onClick={() => {
        setLoading(true)

        signIn.social({
          callbackURL: AUTHENTICATED_PATHNAME,
          provider: "github",
          fetchOptions: {
            onError() {
              setLoading(false)
              toast.error("Failed to sign in with GitHub")
            },
          },
        })
      }}
      variant="outline"
    >
      {loading ? (
        <>
          <Icon.Loader className="mr-2 h-4 w-4 animate-spin" />
          Signing in...
        </>
      ) : (
        <>
          <Icon.GitHub />
          GitHub
        </>
      )}
    </Button>
  )
}
