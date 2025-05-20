import { defu } from "defu"
import type { Metadata } from "next"
import type { Thing, WithContext } from "schema-dts"

type JsonLdProps = {
  code: WithContext<Thing>
}

export function JsonLd({ code }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: This is a JSON-LD script, not user-generated content.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(code) }}
    />
  )
}

export * from "schema-dts" // Re-exporting schema-dts types

type MetadataCreator = (
  args: Omit<Metadata, "description" | "title" | "twitter"> & {
    title: string
    description: string
    image?: string
    twitterHandle?: string
  }
) => Metadata

export function buildMetadataCreator({
  applicationName,
  author,
  publisher,
}: {
  applicationName: string
  author: {
    name: string
    url: string
  }
  publisher: string
}): MetadataCreator {
  return ({
    title,
    description,
    image,
    authors, // Allow overriding authors
    twitterHandle,
    ...properties
  }): Metadata => {
    const parsedTitle = `${title} | ${applicationName}`

    const defaultMetadata: Metadata = {
      title: parsedTitle,
      description,
      applicationName,
      authors: authors ?? [author], // Use provided authors or default
      creator: author.name,
      publisher, // Added publisher here as it's part of the base config
      formatDetection: {
        telephone: false,
      },
      appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: parsedTitle,
      },
      openGraph: {
        title: parsedTitle,
        description,
        type: "website",
        siteName: applicationName,
        locale: "en_US", // Default locale
      },
      twitter: {
        card: "summary_large_image",
        // Only add creator if twitterHandle is provided
        ...(twitterHandle && { creator: twitterHandle }),
      },
    }

    const metadata = defu(properties, defaultMetadata) as Metadata

    // Ensure openGraph images are handled correctly, even if properties.openGraph exists
    if (image) {
      const images = Array.isArray(properties.openGraph?.images)
        ? properties.openGraph.images
        : [properties.openGraph?.images ?? []].flat()

      metadata.openGraph = {
        ...metadata.openGraph, // Preserve existing openGraph properties
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: title, // Use the main title for alt text
          },
          // Allow for additional images if passed in properties.openGraph.images
          ...images,
        ],
      }
    }

    // Ensure twitter object exists for image assignment
    if (typeof metadata.twitter !== "object" || metadata.twitter === null) {
      // If twitter is not a valid object, initialize it, preserving creator if handle exists.
      // This handles cases where properties might have set twitter to null or undefined.
      metadata.twitter = {
        card: "summary_large_image",
        ...(twitterHandle && { creator: twitterHandle }),
      }
    }

    // Ensure twitter images are handled correctly
    if (image && metadata.twitter && !metadata.twitter.images) {
      metadata.twitter.images = [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ]
    }

    return metadata
  }
}
