import { defu } from "defu"
import type { Metadata } from "next"

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
    authors,
    twitterHandle,
    ...properties
  }): Metadata => {
    const parsedTitle = `${title} | ${applicationName}`

    const defaultMetadata: Metadata = {
      title: parsedTitle,
      description,
      applicationName,
      authors: authors ?? [author],
      creator: author.name,
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
        locale: "en_US",
      },
      publisher,
      twitter: {
        card: "summary_large_image",
        creator: twitterHandle,
      },
    }

    const metadata = defu(properties, defaultMetadata)

    if (image && metadata.openGraph) {
      metadata.openGraph.images = [
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
