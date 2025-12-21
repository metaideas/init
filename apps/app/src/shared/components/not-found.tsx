import { Button } from "@init/ui/components/button"
import { Icon } from "@init/ui/components/icon"
import { Link, useCanGoBack, useRouter } from "@tanstack/react-router"

export default function NotFound() {
  const router = useRouter()
  const canGoBack = useCanGoBack()

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 animate-pulse bg-primary/20 blur-3xl" />
            <h1 className="relative font-bold text-[clamp(4rem,20vw,12rem)] leading-none tracking-tighter">
              404
            </h1>
          </div>
        </div>

        <div className="mb-8 space-y-3">
          <h2 className="font-semibold text-2xl tracking-tight sm:text-3xl">
            Page not found
          </h2>
          <p className="mx-auto max-w-md text-lg text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            className="min-w-[140px]"
            render={<Link to="/" />}
            size="lg"
            variant="default"
          >
            <Icon.Home className="mr-2 size-4" />
            Go Home
          </Button>

          {canGoBack && (
            <Button
              className="min-w-[140px]"
              onClick={() => router.history.back()}
              size="lg"
              variant="outline"
            >
              <Icon.ArrowLeft className="mr-2 size-4" />
              Go Back
            </Button>
          )}
        </div>

        <div className="mt-12 flex items-center justify-center gap-2 text-muted-foreground text-sm">
          <Icon.Search className="size-4" />
          <p>Lost? Try searching or return to the homepage</p>
        </div>
      </div>
    </div>
  )
}
