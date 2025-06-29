"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Gamepad2, Users, Clock, TrendingDown, TrendingUp } from "lucide-react"

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return
    
    if (session) {
      if (session.user.role === "PARENT") {
        router.push("/parent")
      } else if (session.user.role === "CHILD") {
        router.push("/child")
      }
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Gamepad2 className="h-12 w-12 text-indigo-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-800">Loading...</p>
        </div>
      </div>
    )
  }

  if (session) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Gamepad2 className="h-20 w-20 text-indigo-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Xbox Behavior Tracker
          </h1>
                      <p className="text-xl text-gray-800 mb-8 max-w-2xl mx-auto">
            A smart parenting tool to manage your child&apos;s Xbox time based on their behavior. 
            Track, reward, and teach responsibility while maintaining healthy screen time limits.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={() => router.push("/login")}
              size="lg"
              className="px-8"
            >
              Get Started
            </Button>
            <Button 
              variant="outline"
              size="lg"
              onClick={() => router.push("/login")}
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16">
          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-indigo-600 mb-4" />
              <CardTitle>Multi-Child Support</CardTitle>
              <CardDescription>
                Manage Xbox time for multiple children with individual profiles and settings
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Clock className="h-10 w-10 text-green-600 mb-4" />
              <CardTitle>Daily Time Limits</CardTitle>
              <CardDescription>
                Set daily allowances with automatic resets and flexible time management
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <TrendingDown className="h-10 w-10 text-red-600 mb-4" />
              <CardTitle>Behavior Consequences</CardTitle>
              <CardDescription>
                Deduct time for poor behavior with custom reasons and adjustable amounts
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-blue-600 mb-4" />
              <CardTitle>Reward Good Behavior</CardTitle>
              <CardDescription>
                Add extra time for chores, homework completion, and positive actions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Gamepad2 className="h-10 w-10 text-purple-600 mb-4" />
              <CardTitle>Child Dashboard</CardTitle>
              <CardDescription>
                Kids can check their remaining time and see their behavior history
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-orange-600 mb-4" />
              <CardTitle>Parent Control</CardTitle>
              <CardDescription>
                Full parental oversight with detailed logs and instant time adjustments
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* How It Works */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-indigo-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Set Daily Allowance</h3>
              <p className="text-gray-800">
                Configure how much Xbox time your child gets each day (e.g., 3 hours)
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Track Behavior</h3>
              <p className="text-gray-800">
                Add or remove time based on your child&apos;s actions throughout the day
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Let Them Check</h3>
              <p className="text-gray-800">
                Children can log in to see their remaining time and behavior history
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Start Managing Xbox Time?
              </h3>
              <p className="text-gray-800 mb-6">
                Create your account and set up your first child&apos;s profile in minutes
              </p>
              <Button 
                onClick={() => router.push("/login")}
                size="lg"
                className="px-8"
              >
                Get Started Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
