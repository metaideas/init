import { toast } from "@init/ui/components/toast"
import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { AUTHENTICATED_PATHNAME, UNAUTHENTICATED_PATHNAME } from "#features/auth/constants.ts"
import { signIn, signOut } from "#shared/auth.ts"

type SocialProvider = "github" | "google"

export function useSocialSignIn(provider: SocialProvider, errorTitle: string) {
  const [isSigningIn, setIsSigningIn] = useState(false)

  function signInWithProvider() {
    setIsSigningIn(true)

    void signIn.social({
      callbackURL: AUTHENTICATED_PATHNAME,
      fetchOptions: {
        onError() {
          setIsSigningIn(false)
          toast.add({ title: errorTitle, type: "error" })
        },
      },
      provider,
    })
  }

  return { isSigningIn, signInWithProvider }
}

export function useSignOut() {
  const navigate = useNavigate()
  const [isSigningOut, setIsSigningOut] = useState(false)

  function signOutAndRedirect() {
    setIsSigningOut(true)

    void signOut({
      fetchOptions: {
        onError: () => {
          setIsSigningOut(false)
        },
        onSuccess: () => {
          void navigate({ to: UNAUTHENTICATED_PATHNAME })
        },
      },
    })
  }

  return { isSigningOut, signOutAndRedirect }
}
