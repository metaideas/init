import { getCurrentUser } from "~/server/loaders"

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  await getCurrentUser() // Get the user and redirect if not logged in

  return <main>{children}</main>
}
