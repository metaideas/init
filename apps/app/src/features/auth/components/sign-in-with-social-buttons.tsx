import { Button } from "@v1/ui/components/button"
import { Icon } from "@v1/ui/components/icon"
import { cn } from "cn"
import { useSocialSignIn } from "#features/auth/hooks.ts"

export function SignInWithGoogleButton({ className }: { className?: string }) {
  const { isSigningIn, signInWithProvider } = useSocialSignIn(
    "google",
    "Failed to sign in with Google"
  )

  return (
    <Button
      className={cn("flex gap-3", className)}
      disabled={isSigningIn}
      onClick={signInWithProvider}
      variant="outline"
    >
      {isSigningIn ? (
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
  const { isSigningIn, signInWithProvider } = useSocialSignIn(
    "github",
    "Failed to sign in with GitHub"
  )

  return (
    <Button
      className={cn("flex gap-3", className)}
      disabled={isSigningIn}
      onClick={signInWithProvider}
      variant="outline"
    >
      {isSigningIn ? (
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
