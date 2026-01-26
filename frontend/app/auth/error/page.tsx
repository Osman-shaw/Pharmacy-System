import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { XCircle } from "lucide-react"
import Link from "next/link"

export default async function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-emerald-50 to-green-50 p-6">
      <div className="w-full max-w-md">
        <Card className="border-red-100">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Authentication Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {params?.error ? (
              <p className="text-center text-sm text-muted-foreground">Error: {params.error}</p>
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                An unexpected error occurred during authentication.
              </p>
            )}
            <div className="text-center">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-emerald-600 underline-offset-4 hover:underline"
              >
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
