import { Alert, AlertAction, AlertDescription, AlertTitle } from "@init/ui/components/alert"
import { Avatar, AvatarFallback, AvatarGroup } from "@init/ui/components/avatar"
import { Button } from "@init/ui/components/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@init/ui/components/empty"
import { Icon } from "@init/ui/components/icon"
import { Progress, ProgressLabel, ProgressValue } from "@init/ui/components/progress"
import { Skeleton } from "@init/ui/components/skeleton"
import { toast } from "@init/ui/components/toast"
import ShowcaseDemo from "#features/showcase/components/showcase-demo.tsx"
import ShowcaseSection from "#features/showcase/components/showcase-section.tsx"
import { PROGRESS_VALUES } from "#features/showcase/constants.ts"

export default function ShowcaseFeedback() {
  return (
    <>
      <ShowcaseSection id="alert">
        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
          <Alert>
            <Icon.CircleCheck />
            <AlertTitle>Payment successful</AlertTitle>
            <AlertDescription>Your payment of $29.00 has been processed.</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <Icon.AlertCircle />
            <AlertTitle>Unable to process payment</AlertTitle>
            <AlertDescription>
              <p>Please verify your billing information and try again.</p>
              <ul className="list-inside list-disc text-sm">
                <li>Check your card details</li>
                <li>Ensure sufficient funds</li>
              </ul>
            </AlertDescription>
          </Alert>
          <Alert>
            <Icon.Info />
            <AlertTitle>New version available</AlertTitle>
            <AlertDescription>Reload to get the latest features.</AlertDescription>
            <AlertAction>
              <Button size="xs" variant="outline">
                Reload
              </Button>
            </AlertAction>
          </Alert>
          <Alert>
            <AlertTitle>Without an icon</AlertTitle>
            <AlertDescription>
              Alerts also work as plain text and can hold <a href="#alert">inline links</a>.
            </AlertDescription>
          </Alert>
        </div>
      </ShowcaseSection>

      <ShowcaseSection id="progress">
        <div className="grid max-w-md grid-cols-1 gap-6">
          {PROGRESS_VALUES.map((value) => (
            <Progress key={value} value={value}>
              <ProgressLabel>Upload</ProgressLabel>
              <ProgressValue />
            </Progress>
          ))}
          <Progress value={null}>
            <ProgressLabel>Indeterminate</ProgressLabel>
          </Progress>
        </div>
      </ShowcaseSection>

      <ShowcaseSection id="skeleton">
        <ShowcaseDemo label="Profile">
          <div className="flex items-center gap-4">
            <Skeleton className="size-12 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
        </ShowcaseDemo>
        <ShowcaseDemo className="grid max-w-xs grid-cols-1 gap-3" label="Card">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </ShowcaseDemo>
      </ShowcaseSection>

      <ShowcaseSection id="empty">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Icon.Search />
              </EmptyMedia>
              <EmptyTitle>No results</EmptyTitle>
              <EmptyDescription>Try adjusting your search or filters.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button size="sm" variant="outline">
                Clear filters
              </Button>
            </EmptyContent>
          </Empty>
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia>
                <AvatarGroup>
                  <Avatar>
                    <AvatarFallback>AL</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback>GH</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback>LT</AvatarFallback>
                  </Avatar>
                </AvatarGroup>
              </EmptyMedia>
              <EmptyTitle>No team members</EmptyTitle>
              <EmptyDescription>
                Invite your team to collaborate. <a href="#empty">Read the guide</a>.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button size="sm">
                <Icon.Plus data-icon="inline-start" />
                Invite members
              </Button>
            </EmptyContent>
          </Empty>
        </div>
      </ShowcaseSection>

      <ShowcaseSection
        description="Toasts use the app-wide Toaster mounted in the root providers."
        id="toast"
      >
        <ShowcaseDemo label="Types">
          <Button
            onClick={() => {
              toast.add({ description: "Your changes are saved.", title: "Default toast" })
            }}
            variant="outline"
          >
            Default
          </Button>
          <Button
            onClick={() => {
              toast.add({ title: "Profile updated", type: "success" })
            }}
            variant="outline"
          >
            Success
          </Button>
          <Button
            onClick={() => {
              toast.add({ description: "A new version is available.", title: "Info", type: "info" })
            }}
            variant="outline"
          >
            Info
          </Button>
          <Button
            onClick={() => {
              toast.add({
                description: "Your storage is almost full.",
                title: "Warning",
                type: "warning",
              })
            }}
            variant="outline"
          >
            Warning
          </Button>
          <Button
            onClick={() => {
              toast.add({ description: "Please try again.", title: "Upload failed", type: "error" })
            }}
            variant="outline"
          >
            Error
          </Button>
        </ShowcaseDemo>
        <ShowcaseDemo label="Action and promise">
          <Button
            onClick={() => {
              toast.add({
                actionProps: {
                  children: "Undo",
                  onClick: () => {
                    toast.add({ title: "Restored", type: "success" })
                  },
                },
                description: "The message was moved to the trash.",
                title: "Message deleted",
              })
            }}
            variant="outline"
          >
            With action
          </Button>
          <Button
            onClick={() => {
              void toast.promise(
                new Promise((resolve) => {
                  setTimeout(resolve, 2000)
                }),
                {
                  error: "Something went wrong",
                  loading: "Publishing...",
                  success: "Published",
                }
              )
            }}
            variant="outline"
          >
            Promise
          </Button>
        </ShowcaseDemo>
      </ShowcaseSection>
    </>
  )
}
