import Feather from "@expo/vector-icons/Feather"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@init/native-ui/components/accordion"
import { ActivityIndicator } from "@init/native-ui/components/activity-indicator"
import { Alert, AlertDescription, AlertTitle } from "@init/native-ui/components/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@init/native-ui/components/alert-dialog"
import { AspectRatio } from "@init/native-ui/components/aspect-ratio"
import { Avatar, AvatarFallback, AvatarImage } from "@init/native-ui/components/avatar"
import { Badge } from "@init/native-ui/components/badge"
import { Button } from "@init/native-ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@init/native-ui/components/card"
import { Checkbox } from "@init/native-ui/components/checkbox"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@init/native-ui/components/collapsible"
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@init/native-ui/components/context-menu"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@init/native-ui/components/dialog"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@init/native-ui/components/dropdown-menu"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@init/native-ui/components/hover-card"
import { CheckIcon, Icon, XIcon } from "@init/native-ui/components/icon"
import { Input } from "@init/native-ui/components/input"
import { Label } from "@init/native-ui/components/label"
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@init/native-ui/components/menubar"
import { Popover, PopoverContent, PopoverTrigger } from "@init/native-ui/components/popover"
import { Progress } from "@init/native-ui/components/progress"
import { RadioGroup, RadioGroupItem } from "@init/native-ui/components/radio-group"
import {
  NativeSelectScrollView,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  type Option,
} from "@init/native-ui/components/select"
import { Separator } from "@init/native-ui/components/separator"
import { Skeleton } from "@init/native-ui/components/skeleton"
import { Switch } from "@init/native-ui/components/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@init/native-ui/components/tabs"
import { Text } from "@init/native-ui/components/text"
import { Textarea } from "@init/native-ui/components/textarea"
import { Toggle, ToggleIcon } from "@init/native-ui/components/toggle"
import {
  ToggleGroup,
  ToggleGroupIcon,
  ToggleGroupItem,
} from "@init/native-ui/components/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@init/native-ui/components/tooltip"
import { Stack } from "expo-router"
import { useState, type ReactNode } from "react"
import { ScrollView, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import env from "#shared/env.ts"

type ShowcaseSectionProps = {
  children: ReactNode
  description?: string
  query: string
  searchTerms?: string[]
  title: string
}

function ShowcaseSection({
  children,
  description,
  query,
  searchTerms,
  title,
}: ShowcaseSectionProps) {
  const normalizedQuery = query.trim().toLowerCase()
  const normalizedTerms = [title, ...(searchTerms ?? [])].join(" ").toLowerCase()

  if (normalizedQuery.length > 0 && !normalizedTerms.includes(normalizedQuery)) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="gap-3">{children}</CardContent>
    </Card>
  )
}

export default function Screen() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isChecked, setIsChecked] = useState(true)
  const [isSwitchEnabled, setIsSwitchEnabled] = useState(false)
  const [isCollapsedOpen, setIsCollapsedOpen] = useState(false)
  const [progressValue, setProgressValue] = useState(42)
  const [radioValue, setRadioValue] = useState("starter")
  const [tabValue, setTabValue] = useState("preview")
  const [togglePressed, setTogglePressed] = useState(false)
  const [toggleGroupValue, setToggleGroupValue] = useState<string | undefined>("bold")
  const [selectValue, setSelectValue] = useState<Option>({
    label: "Starter",
    value: "starter",
  })

  const [dropdownChecked, setDropdownChecked] = useState(true)
  const [dropdownRadioValue, setDropdownRadioValue] = useState("balanced")

  const [contextChecked, setContextChecked] = useState(false)
  const [contextRadioValue, setContextRadioValue] = useState("compact")

  const [menubarChecked, setMenubarChecked] = useState(true)
  const [menubarRadioValue, setMenubarRadioValue] = useState("left")

  const normalizedQuery = searchQuery.trim().toLowerCase()

  const searchIndex = [
    "status activity indicator",
    "text typography",
    "alert",
    "avatar badge",
    "button",
    "input label textarea form",
    "checkbox switch radio group",
    "toggle toggle group",
    "progress",
    "skeleton",
    "separator",
    "aspect ratio",
    "card",
    "accordion",
    "collapsible",
    "tabs",
    "select",
    "dropdown menu",
    "context menu",
    "menubar",
    "popover hover card tooltip",
    "dialog",
    "alert dialog",
  ]

  const hasSearchMatches =
    normalizedQuery.length === 0 || searchIndex.some((entry) => entry.includes(normalizedQuery))

  function decreaseProgress() {
    setProgressValue((value) => Math.max(0, value - 10))
  }

  function increaseProgress() {
    setProgressValue((value) => Math.min(100, value + 10))
  }

  function clearSearch() {
    setSearchQuery("")
  }

  function renderShowcaseSections() {
    return (
      <>
        <ShowcaseSection
          query={searchQuery}
          title="Status"
          description={`API: ${env.EXPO_PUBLIC_API_URL}`}
          searchTerms={["activity indicator"]}
        >
          <View className="flex-row items-center gap-3">
            <Button
              onPress={() => {
                setIsLoading((value) => !value)
              }}
            >
              <Text>{isLoading ? "Stop" : "Start"}</Text>
            </Button>
            {isLoading ? <ActivityIndicator /> : <Text>Idle</Text>}
          </View>
        </ShowcaseSection>

        <ShowcaseSection query={searchQuery} title="Text" searchTerms={["typography"]}>
          <Text variant="h4">Typography Samples</Text>
          <Text variant="p">This screen is a live playground for every native UI primitive.</Text>
          <Text variant="muted">Use these examples as the source for mobile screens.</Text>
        </ShowcaseSection>

        <ShowcaseSection query={searchQuery} title="Alert">
          <Alert icon={CheckIcon}>
            <AlertTitle>Saved</AlertTitle>
            <AlertDescription>Preferences were updated successfully.</AlertDescription>
          </Alert>
          <Alert icon={XIcon} variant="destructive">
            <AlertTitle>Action failed</AlertTitle>
            <AlertDescription>We could not complete that request. Try again.</AlertDescription>
          </Alert>
        </ShowcaseSection>

        <ShowcaseSection
          query={searchQuery}
          title="Avatar and Badge"
          searchTerms={["avatar", "badge"]}
        >
          <View className="flex-row items-center gap-3">
            <Avatar alt="Adel Rodriguez" className="size-12">
              <AvatarImage source={{ uri: "https://i.pravatar.cc/120?img=8" }} />
              <AvatarFallback>
                <Text>AR</Text>
              </AvatarFallback>
            </Avatar>
            <View className="gap-2">
              <Badge>
                <Text>Default</Text>
              </Badge>
              <Badge variant="secondary">
                <Text>Secondary</Text>
              </Badge>
              <Badge variant="destructive">
                <Text>Error</Text>
              </Badge>
              <Badge variant="outline">
                <Text>Outline</Text>
              </Badge>
            </View>
          </View>
        </ShowcaseSection>

        <ShowcaseSection query={searchQuery} title="Button">
          <View className="flex-row flex-wrap items-center gap-2">
            <Button>
              <Text>Default</Text>
            </Button>
            <Button variant="destructive">
              <Text>Destructive</Text>
            </Button>
            <Button variant="outline">
              <Text>Outline</Text>
            </Button>
            <Button variant="secondary">
              <Text>Secondary</Text>
            </Button>
            <Button variant="ghost">
              <Text>Ghost</Text>
            </Button>
            <Button variant="link">
              <Text>Link</Text>
            </Button>
            <Button size="icon">
              <Icon as={Feather} className="size-4 text-primary-foreground" name="heart" />
            </Button>
          </View>
        </ShowcaseSection>

        <ShowcaseSection
          query={searchQuery}
          title="Input, Label, Textarea"
          searchTerms={["input", "label", "textarea", "form"]}
        >
          <View className="gap-2">
            <Label>Email</Label>
            <Input placeholder="name@company.com" />
          </View>
          <View className="gap-2">
            <Label>Project Notes</Label>
            <Textarea placeholder="Write additional context for the team..." />
          </View>
        </ShowcaseSection>

        <ShowcaseSection
          query={searchQuery}
          title="Checkbox, Switch, Radio Group"
          searchTerms={["checkbox", "switch", "radio", "group"]}
        >
          <View className="flex-row items-center gap-3">
            <Checkbox checked={isChecked} onCheckedChange={setIsChecked} />
            <Label>Receive release notifications</Label>
          </View>
          <View className="flex-row items-center justify-between">
            <Label>Enable background sync</Label>
            <Switch checked={isSwitchEnabled} onCheckedChange={setIsSwitchEnabled} />
          </View>
          <RadioGroup value={radioValue} onValueChange={setRadioValue}>
            <View className="flex-row items-center gap-3">
              <RadioGroupItem value="starter" />
              <Label>Starter</Label>
            </View>
            <View className="flex-row items-center gap-3">
              <RadioGroupItem value="pro" />
              <Label>Pro</Label>
            </View>
            <View className="flex-row items-center gap-3">
              <RadioGroupItem value="enterprise" />
              <Label>Enterprise</Label>
            </View>
          </RadioGroup>
        </ShowcaseSection>

        <ShowcaseSection
          query={searchQuery}
          title="Toggle and Toggle Group"
          searchTerms={["toggle", "toggle group"]}
        >
          <Toggle pressed={togglePressed} onPressedChange={setTogglePressed} variant="outline">
            <ToggleIcon as={Feather} name="star" />
            <Text>Favorite</Text>
          </Toggle>

          <ToggleGroup
            type="single"
            value={toggleGroupValue}
            onValueChange={setToggleGroupValue}
            variant="outline"
          >
            <ToggleGroupItem isFirst value="bold">
              <ToggleGroupIcon as={Feather} name="bold" />
            </ToggleGroupItem>
            <ToggleGroupItem value="italic">
              <ToggleGroupIcon as={Feather} name="italic" />
            </ToggleGroupItem>
            <ToggleGroupItem isLast value="underline">
              <ToggleGroupIcon as={Feather} name="underline" />
            </ToggleGroupItem>
          </ToggleGroup>
        </ShowcaseSection>

        <ShowcaseSection query={searchQuery} title="Progress">
          <Progress value={progressValue} />
          <View className="flex-row items-center gap-2">
            <Button onPress={decreaseProgress} size="sm" variant="outline">
              <Text>-10</Text>
            </Button>
            <Button onPress={increaseProgress} size="sm" variant="outline">
              <Text>+10</Text>
            </Button>
            <Text>{progressValue}%</Text>
          </View>
        </ShowcaseSection>

        <ShowcaseSection query={searchQuery} title="Skeleton">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-20 w-full" />
        </ShowcaseSection>

        <ShowcaseSection query={searchQuery} title="Separator">
          <View className="gap-2">
            <Text>Horizontal separator</Text>
            <Separator />
          </View>
          <View className="h-6 flex-row items-center gap-3">
            <Text>A</Text>
            <Separator orientation="vertical" />
            <Text>B</Text>
          </View>
        </ShowcaseSection>

        <ShowcaseSection query={searchQuery} title="Aspect Ratio" searchTerms={["aspect ratio"]}>
          <AspectRatio ratio={16 / 9} className="w-full overflow-hidden rounded-md bg-muted">
            <View className="flex-1 items-center justify-center bg-secondary">
              <Text>16:9 Preview</Text>
            </View>
          </AspectRatio>
        </ShowcaseSection>

        <ShowcaseSection query={searchQuery} title="Card">
          <Card>
            <CardHeader>
              <CardTitle>Migration Checklist</CardTitle>
              <CardDescription>Verify all mobile primitives are wired correctly.</CardDescription>
            </CardHeader>
            <CardContent>
              <Text>All showcase components now come from @init/native-ui.</Text>
            </CardContent>
          </Card>
        </ShowcaseSection>

        <ShowcaseSection query={searchQuery} title="Accordion">
          <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1">
              <AccordionTrigger>
                <Text>What is included?</Text>
              </AccordionTrigger>
              <AccordionContent>
                <Text>Every React Native Reusables primitive is configured in this package.</Text>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>
                <Text>How should we consume components?</Text>
              </AccordionTrigger>
              <AccordionContent>
                <Text>Import all components from @init/native-ui/components/* only.</Text>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </ShowcaseSection>

        <ShowcaseSection query={searchQuery} title="Collapsible">
          <Collapsible open={isCollapsedOpen} onOpenChange={setIsCollapsedOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline">
                <Text>{isCollapsedOpen ? "Hide" : "Show"} details</Text>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
              <Text>Collapsible content is useful for compact forms and settings sections.</Text>
            </CollapsibleContent>
          </Collapsible>
        </ShowcaseSection>

        <ShowcaseSection query={searchQuery} title="Tabs">
          <Tabs value={tabValue} onValueChange={setTabValue}>
            <TabsList>
              <TabsTrigger value="preview">
                <Text>Preview</Text>
              </TabsTrigger>
              <TabsTrigger value="code">
                <Text>Code</Text>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="preview">
              <Text>Preview tab content.</Text>
            </TabsContent>
            <TabsContent value="code">
              <Text>Code tab content.</Text>
            </TabsContent>
          </Tabs>
        </ShowcaseSection>

        <ShowcaseSection query={searchQuery} title="Select">
          <Select value={selectValue} onValueChange={setSelectValue}>
            <SelectTrigger>
              <SelectValue placeholder="Select a plan" />
            </SelectTrigger>
            <SelectContent>
              <NativeSelectScrollView>
                <SelectGroup>
                  <SelectLabel>Plans</SelectLabel>
                  <SelectItem label="Starter" value="starter" />
                  <SelectItem label="Pro" value="pro" />
                  <SelectSeparator />
                  <SelectItem label="Enterprise" value="enterprise" />
                </SelectGroup>
              </NativeSelectScrollView>
            </SelectContent>
          </Select>
        </ShowcaseSection>

        <ShowcaseSection query={searchQuery} title="Dropdown Menu" searchTerms={["dropdown"]}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Text>Open Menu</Text>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Text>Edit</Text>
                <DropdownMenuShortcut>E</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Text>Share</Text>
                <DropdownMenuShortcut>S</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuCheckboxItem
                checked={dropdownChecked}
                onCheckedChange={setDropdownChecked}
              >
                <Text>Enable Sync</Text>
              </DropdownMenuCheckboxItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Text>Density</Text>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={dropdownRadioValue}
                    onValueChange={setDropdownRadioValue}
                  >
                    <DropdownMenuRadioItem value="compact">
                      <Text>Compact</Text>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="balanced">
                      <Text>Balanced</Text>
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        </ShowcaseSection>

        <ShowcaseSection query={searchQuery} title="Context Menu" searchTerms={["context"]}>
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <Button variant="outline">
                <Text>Long press me</Text>
              </Button>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuLabel>File</ContextMenuLabel>
              <ContextMenuSeparator />
              <ContextMenuItem>
                <Text>Rename</Text>
                <ContextMenuShortcut>R</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem>
                <Text>Duplicate</Text>
                <ContextMenuShortcut>D</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuCheckboxItem checked={contextChecked} onCheckedChange={setContextChecked}>
                <Text>Pin item</Text>
              </ContextMenuCheckboxItem>
              <ContextMenuSub>
                <ContextMenuSubTrigger>
                  <Text>View</Text>
                </ContextMenuSubTrigger>
                <ContextMenuSubContent>
                  <ContextMenuRadioGroup
                    value={contextRadioValue}
                    onValueChange={setContextRadioValue}
                  >
                    <ContextMenuRadioItem value="compact">
                      <Text>Compact</Text>
                    </ContextMenuRadioItem>
                    <ContextMenuRadioItem value="comfortable">
                      <Text>Comfortable</Text>
                    </ContextMenuRadioItem>
                  </ContextMenuRadioGroup>
                </ContextMenuSubContent>
              </ContextMenuSub>
            </ContextMenuContent>
          </ContextMenu>
        </ShowcaseSection>

        <ShowcaseSection query={searchQuery} title="Menubar">
          <Menubar>
            <MenubarMenu value="file">
              <MenubarTrigger>
                <Text>File</Text>
              </MenubarTrigger>
              <MenubarContent>
                <MenubarItem>
                  <Text>New</Text>
                </MenubarItem>
                <MenubarItem>
                  <Text>Open</Text>
                </MenubarItem>
                <MenubarSeparator />
                <MenubarCheckboxItem checked={menubarChecked} onCheckedChange={setMenubarChecked}>
                  <Text>Autosave</Text>
                </MenubarCheckboxItem>
                <MenubarSub>
                  <MenubarSubTrigger>
                    <Text>Align</Text>
                  </MenubarSubTrigger>
                  <MenubarSubContent>
                    <MenubarRadioGroup
                      value={menubarRadioValue}
                      onValueChange={setMenubarRadioValue}
                    >
                      <MenubarRadioItem value="left">
                        <Text>Left</Text>
                      </MenubarRadioItem>
                      <MenubarRadioItem value="center">
                        <Text>Center</Text>
                      </MenubarRadioItem>
                      <MenubarRadioItem value="right">
                        <Text>Right</Text>
                      </MenubarRadioItem>
                    </MenubarRadioGroup>
                  </MenubarSubContent>
                </MenubarSub>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </ShowcaseSection>

        <ShowcaseSection
          query={searchQuery}
          title="Popover, Hover Card, Tooltip"
          searchTerms={["popover", "hover", "tooltip"]}
        >
          <View className="flex-row flex-wrap items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Text>Popover</Text>
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Text className="font-medium">Team settings</Text>
                <Text className="text-sm text-muted-foreground">Manage project visibility.</Text>
              </PopoverContent>
            </Popover>

            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="outline">
                  <Text>@init/native-ui</Text>
                </Button>
              </HoverCardTrigger>
              <HoverCardContent>
                <Text className="font-medium">Native UI Package</Text>
                <Text className="text-sm text-muted-foreground">
                  Shared React Native reusables for all mobile screens.
                </Text>
              </HoverCardContent>
            </HoverCard>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="outline">
                  <Icon as={Feather} name="info" className="size-4 text-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <Text>Helpful tip</Text>
              </TooltipContent>
            </Tooltip>
          </View>
        </ShowcaseSection>

        <ShowcaseSection query={searchQuery} title="Dialog">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Text>Open Dialog</Text>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Quick Edit</DialogTitle>
                <DialogDescription>Update the profile details.</DialogDescription>
              </DialogHeader>
              <View className="gap-2">
                <Label>Display Name</Label>
                <Input placeholder="Ada Lovelace" />
              </View>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">
                    <Text>Close</Text>
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </ShowcaseSection>

        <ShowcaseSection
          query={searchQuery}
          title="Alert Dialog"
          searchTerms={["confirm", "destructive"]}
        >
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Text>Delete Project</Text>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete project?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action is permanent and cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  <Text>Cancel</Text>
                </AlertDialogCancel>
                <AlertDialogAction>
                  <Text>Delete</Text>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </ShowcaseSection>
      </>
    )
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView className="flex-1 bg-background">
        <ScrollView className="flex-1" contentInsetAdjustmentBehavior="automatic">
          <View className="gap-4 p-4 pb-24">
            <View className="gap-3">
              <Text className="text-4xl font-semibold tracking-tight">UI Showcase</Text>
              <View className="flex-row items-center gap-2">
                <Input
                  className="flex-1"
                  onChangeText={setSearchQuery}
                  placeholder="Search sections..."
                  returnKeyType="search"
                  value={searchQuery}
                />
                {searchQuery.length > 0 ? (
                  <Button onPress={clearSearch} size="icon" variant="ghost">
                    <Icon as={XIcon} className="size-4 text-muted-foreground" />
                  </Button>
                ) : null}
              </View>
            </View>
            {renderShowcaseSections()}
            {hasSearchMatches ? null : (
              <Card>
                <CardContent className="pt-4">
                  <Text>No section matches “{searchQuery}”.</Text>
                </CardContent>
              </Card>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  )
}
