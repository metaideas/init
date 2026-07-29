import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components"

export default function PasswordReset({ resetUrl }: { resetUrl: string }) {
  return (
    <Html>
      <Head />
      <Preview>Reset your password</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto my-10 max-w-xl rounded-lg bg-white p-8 shadow-sm">
            <Heading className="mb-4 text-center text-2xl font-bold text-gray-900">
              Reset your password
            </Heading>
            <Text className="mb-6 text-center text-base text-gray-600">
              Use the button below to choose a new password. If you did not request this, you can
              safely ignore this email.
            </Text>
            <Section className="text-center">
              <Button
                className="inline-block rounded-md bg-black px-6 py-3 font-medium text-white"
                href={resetUrl}
              >
                Choose a new password
              </Button>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
