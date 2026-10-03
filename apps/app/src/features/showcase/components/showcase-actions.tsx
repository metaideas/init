import { Badge, badgeVariants } from "@init/ui/components/badge"
import { Button, buttonVariants } from "@init/ui/components/button"
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from "@init/ui/components/button-group"
import { Icon, SVGIcon } from "@init/ui/components/icon"
import { Input } from "@init/ui/components/input"
import { Kbd, KbdGroup } from "@init/ui/components/kbd"
import { Spinner } from "@init/ui/components/spinner"
import { Toggle } from "@init/ui/components/toggle"
import { ToggleGroup, ToggleGroupItem } from "@init/ui/components/toggle-group"
import ShowcaseDemo from "#features/showcase/components/showcase-demo.tsx"
import ShowcaseSection from "#features/showcase/components/showcase-section.tsx"
import {
  BADGE_VARIANTS,
  BUTTON_ICON_SIZES,
  BUTTON_SIZES,
  BUTTON_VARIANTS,
  TOGGLE_SIZES,
} from "#features/showcase/constants.ts"

export default function ShowcaseActions() {
  return (
    <>
      <ShowcaseSection id="button">
        <ShowcaseDemo label="Variants">
          {BUTTON_VARIANTS.map((variant) => (
            <Button key={variant} variant={variant}>
              {variant}
            </Button>
          ))}
        </ShowcaseDemo>
        <ShowcaseDemo label="Sizes">
          {BUTTON_SIZES.map((size) => (
            <Button key={size} size={size} variant="outline">
              Size {size}
            </Button>
          ))}
        </ShowcaseDemo>
        <ShowcaseDemo label="Icon sizes">
          {BUTTON_ICON_SIZES.map((size) => (
            <Button aria-label={`Add (${size})`} key={size} size={size} variant="outline">
              <Icon.Plus />
            </Button>
          ))}
        </ShowcaseDemo>
        <ShowcaseDemo label="With icons">
          <Button>
            <Icon.Plus data-icon="inline-start" />
            New project
          </Button>
          <Button variant="secondary">
            Continue
            <Icon.ArrowRight data-icon="inline-end" />
          </Button>
          <Button variant="outline">
            <Icon.Search data-icon="inline-start" />
            Search
          </Button>
          <Button variant="destructive">
            <Icon.X data-icon="inline-start" />
            Delete
          </Button>
        </ShowcaseDemo>
        <ShowcaseDemo label="States">
          <Button disabled>
            <Spinner data-icon="inline-start" />
            Saving
          </Button>
          <Button disabled variant="outline">
            Disabled
          </Button>
          <Button disabled variant="secondary">
            Disabled
          </Button>
          <Button aria-invalid variant="outline">
            Invalid
          </Button>
          <a className={buttonVariants({ variant: "outline" })} href="#button">
            Anchor with button styles
          </a>
        </ShowcaseDemo>
      </ShowcaseSection>

      <ShowcaseSection id="button-group">
        <ShowcaseDemo label="Horizontal">
          <ButtonGroup>
            <Button variant="outline">Archive</Button>
            <Button variant="outline">Report</Button>
            <Button variant="outline">Snooze</Button>
          </ButtonGroup>
        </ShowcaseDemo>
        <ShowcaseDemo label="With separator">
          <ButtonGroup>
            <Button variant="secondary">Copy</Button>
            <ButtonGroupSeparator />
            <Button variant="secondary">Paste</Button>
          </ButtonGroup>
        </ShowcaseDemo>
        <ShowcaseDemo label="With text and input">
          <ButtonGroup>
            <ButtonGroupText>https://</ButtonGroupText>
            <Input aria-label="Domain" placeholder="example.com" />
            <Button aria-label="Search domain" size="icon" variant="outline">
              <Icon.Search />
            </Button>
          </ButtonGroup>
        </ShowcaseDemo>
        <ShowcaseDemo label="Vertical">
          <ButtonGroup orientation="vertical">
            <Button aria-label="Increase" size="icon" variant="outline">
              <Icon.Plus />
            </Button>
            <Button aria-label="Decrease" size="icon" variant="outline">
              <Icon.Minus />
            </Button>
          </ButtonGroup>
        </ShowcaseDemo>
        <ShowcaseDemo label="Nested">
          <ButtonGroup>
            <ButtonGroup>
              <Button size="sm" variant="outline">
                1
              </Button>
              <Button size="sm" variant="outline">
                2
              </Button>
              <Button size="sm" variant="outline">
                3
              </Button>
            </ButtonGroup>
            <ButtonGroup>
              <Button aria-label="Previous" size="icon-sm" variant="outline">
                <Icon.ArrowLeft />
              </Button>
              <Button aria-label="Next" size="icon-sm" variant="outline">
                <Icon.ArrowRight />
              </Button>
            </ButtonGroup>
          </ButtonGroup>
        </ShowcaseDemo>
      </ShowcaseSection>

      <ShowcaseSection id="toggle">
        <ShowcaseDemo label="Variants">
          <Toggle aria-label="Toggle bold">
            <span className="font-bold">B</span>
          </Toggle>
          <Toggle aria-label="Toggle italic" variant="outline">
            <span className="italic">I</span>
          </Toggle>
        </ShowcaseDemo>
        <ShowcaseDemo label="Sizes">
          {TOGGLE_SIZES.map((size) => (
            <Toggle aria-label={`Toggle star (${size})`} key={size} size={size} variant="outline">
              <Icon.Sun />
            </Toggle>
          ))}
        </ShowcaseDemo>
        <ShowcaseDemo label="States">
          <Toggle defaultPressed variant="outline">
            <Icon.Check data-icon="inline-start" />
            Pressed
          </Toggle>
          <Toggle variant="outline">
            <Icon.Circle data-icon="inline-start" />
            Unpressed
          </Toggle>
          <Toggle disabled variant="outline">
            Disabled
          </Toggle>
        </ShowcaseDemo>
      </ShowcaseSection>

      <ShowcaseSection id="toggle-group">
        <ShowcaseDemo label="Single selection">
          <ToggleGroup aria-label="Text alignment" defaultValue={["center"]}>
            <ToggleGroupItem value="left">Left</ToggleGroupItem>
            <ToggleGroupItem value="center">Center</ToggleGroupItem>
            <ToggleGroupItem value="right">Right</ToggleGroupItem>
          </ToggleGroup>
        </ShowcaseDemo>
        <ShowcaseDemo label="Multiple, outline, no spacing">
          <ToggleGroup
            aria-label="Text formatting"
            defaultValue={["bold", "underline"]}
            multiple
            spacing={0}
            variant="outline"
          >
            <ToggleGroupItem aria-label="Bold" value="bold">
              <span className="font-bold">B</span>
            </ToggleGroupItem>
            <ToggleGroupItem aria-label="Italic" value="italic">
              <span className="italic">I</span>
            </ToggleGroupItem>
            <ToggleGroupItem aria-label="Underline" value="underline">
              <span className="underline">U</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </ShowcaseDemo>
        <ShowcaseDemo label="Sizes">
          {TOGGLE_SIZES.map((size) => (
            <ToggleGroup
              aria-label={`View (${size})`}
              defaultValue={["grid"]}
              key={size}
              size={size}
              variant="outline"
            >
              <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
              <ToggleGroupItem value="list">List</ToggleGroupItem>
            </ToggleGroup>
          ))}
        </ShowcaseDemo>
        <ShowcaseDemo label="Vertical and disabled">
          <ToggleGroup aria-label="Theme" defaultValue={["light"]} orientation="vertical">
            <ToggleGroupItem value="light">
              <Icon.Sun data-icon="inline-start" />
              Light
            </ToggleGroupItem>
            <ToggleGroupItem value="dark">
              <Icon.Moon data-icon="inline-start" />
              Dark
            </ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup aria-label="Disabled options" disabled variant="outline">
            <ToggleGroupItem value="one">One</ToggleGroupItem>
            <ToggleGroupItem value="two">Two</ToggleGroupItem>
          </ToggleGroup>
        </ShowcaseDemo>
      </ShowcaseSection>

      <ShowcaseSection id="badge">
        <ShowcaseDemo label="Variants">
          {BADGE_VARIANTS.map((variant) => (
            <Badge key={variant} variant={variant}>
              {variant}
            </Badge>
          ))}
        </ShowcaseDemo>
        <ShowcaseDemo label="With icons and content">
          <Badge>
            <Icon.Check data-icon="inline-start" />
            Verified
          </Badge>
          <Badge variant="secondary">
            <Spinner data-icon="inline-start" />
            Syncing
          </Badge>
          <Badge variant="destructive">
            <Icon.AlertCircle data-icon="inline-start" />
            Failed
          </Badge>
          <Badge className="min-w-5 px-1 tabular-nums">8</Badge>
          <Badge className="min-w-5 px-1 tabular-nums" variant="outline">
            99+
          </Badge>
          <a className={badgeVariants({ variant: "outline" })} href="#badge">
            Badge link
            <Icon.ArrowRight data-icon="inline-end" />
          </a>
        </ShowcaseDemo>
      </ShowcaseSection>

      <ShowcaseSection id="kbd">
        <ShowcaseDemo label="Keys">
          <Kbd>⌘</Kbd>
          <Kbd>Shift</Kbd>
          <Kbd>Enter</Kbd>
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
          <KbdGroup>
            <Kbd>Ctrl</Kbd>
            <span>+</span>
            <Kbd>B</Kbd>
          </KbdGroup>
        </ShowcaseDemo>
        <ShowcaseDemo label="In context">
          <p className="text-sm text-muted-foreground">
            Press{" "}
            <KbdGroup>
              <Kbd>⌘</Kbd>
              <Kbd>B</Kbd>
            </KbdGroup>{" "}
            to toggle the sidebar demo.
          </p>
          <Button size="sm" variant="outline">
            Accept <Kbd>⏎</Kbd>
          </Button>
        </ShowcaseDemo>
      </ShowcaseSection>

      <ShowcaseSection id="spinner">
        <ShowcaseDemo label="Sizes and colors">
          <Spinner className="size-3" />
          <Spinner />
          <Spinner className="size-6 text-primary" />
          <Spinner className="size-8 text-muted-foreground" />
        </ShowcaseDemo>
        <ShowcaseDemo label="In components">
          <Button disabled size="sm">
            <Spinner data-icon="inline-start" />
            Loading
          </Button>
          <Badge variant="outline">
            <Spinner data-icon="inline-start" />
            Processing
          </Badge>
        </ShowcaseDemo>
      </ShowcaseSection>

      <ShowcaseSection id="icon">
        <ShowcaseDemo
          className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6"
          label="Icon set"
        >
          {Object.entries(Icon).map(([name, IconComponent]) => (
            <div
              className="flex flex-col items-center gap-2 rounded-lg border p-3 text-xs text-muted-foreground"
              key={name}
            >
              <IconComponent aria-hidden className="size-5 text-foreground" />
              <span className="truncate">{name}</span>
            </div>
          ))}
        </ShowcaseDemo>
        <ShowcaseDemo label="Custom SVG icon">
          <SVGIcon className="text-primary" size={32} title="Custom circle icon">
            <circle cx="10" cy="10" r="8" />
          </SVGIcon>
        </ShowcaseDemo>
      </ShowcaseSection>
    </>
  )
}
