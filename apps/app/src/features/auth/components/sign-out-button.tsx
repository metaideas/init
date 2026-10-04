import { Button } from "@v1/ui/components/button"
import { Icon } from "@v1/ui/components/icon"
import { useSignOut } from "#features/auth/hooks.ts"

export default function SignOutButton() {
  const { isSigningOut, signOutAndRedirect } = useSignOut()

  return (
    <Button disabled={isSigningOut} onClick={signOutAndRedirect} variant="secondary">
      {isSigningOut ? (
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
