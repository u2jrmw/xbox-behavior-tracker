"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Gamepad2, Clock, History, LogOut, TrendingDown, TrendingUp, RotateCcw } from "lucide-react"

interface Child {
  id: string
  name: string
  username: string
  dailyAllowance: number
  currentTime: number
  lastReset: string
  userId?: string
  timeEntries: TimeEntry[]
}

interface TimeEntry {
  id: string
  amount: number
  reason: string
  type: "DEDUCTION" | "ADDITION" | "RESET"
  createdAt: string
  createdBy: {
    username: string
  }
}

export default function ChildDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [child, setChild] = useState<Child | null>(null)
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetchChildData = useCallback(async () => {
    try {
      // Get child profile
      const childResponse = await fetch("/api/children")
      if (childResponse.ok) {
        const children = await childResponse.json()
        const myProfile = children.find((c: Child) => c.userId === session?.user.id)
        
        if (myProfile) {
          setChild(myProfile)
          
          // Get time entries
          const entriesResponse = await fetch(`/api/time-entries?childId=${myProfile.id}`)
          if (entriesResponse.ok) {
            const entries = await entriesResponse.json()
            setTimeEntries(entries)
          }
        }
      }
    } catch (error) {
      console.error("Error fetching child data:", error)
    } finally {
      setLoading(false)
    }
  }, [session?.user.id])

  useEffect(() => {
    if (status === "loading") return
    
    if (!session || session.user.role !== "CHILD") {
      router.push("/login")
      return
    }

    fetchChildData()
  }, [session, status, router, fetchChildData])

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const getTimeColor = (currentTime: number, dailyAllowance: number) => {
    const percentage = (currentTime / dailyAllowance) * 100
    if (percentage <= 15) return "text-red-600"
    if (percentage <= 35) return "text-yellow-600"
    return "text-green-600"
  }

  const getProgressColor = (currentTime: number, dailyAllowance: number) => {
    const percentage = (currentTime / dailyAllowance) * 100
    if (percentage <= 15) return "bg-red-500"
    if (percentage <= 35) return "bg-yellow-500"
    return "bg-green-500"
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100">
        <div className="text-center">
          <Gamepad2 className="h-12 w-12 text-green-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-800">Loading your Xbox time...</p>
        </div>
      </div>
    )
  }

  if (!child) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <Gamepad2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Not Found</h3>
            <p className="text-gray-800 mb-4">Your Xbox time profile hasn&apos;t been set up yet. Please ask your parent to create your profile.</p>
            <Button onClick={() => signOut()}>Sign Out</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const timePercentage = (child.currentTime / child.dailyAllowance) * 100
  const canPlay = child.currentTime > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <Gamepad2 className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Xbox Time</h1>
                             <p className="text-gray-800">Hello, {child.name}!</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => signOut()} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Time Display Card */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Xbox Time Remaining
                </CardTitle>
                <CardDescription>Your available playtime for today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-6xl font-bold mb-4 ${getTimeColor(child.currentTime, child.dailyAllowance)}`}>
                    {formatTime(child.currentTime)}
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                    <div 
                      className={`h-4 rounded-full transition-all ${getProgressColor(child.currentTime, child.dailyAllowance)}`} 
                      style={{ width: `${Math.max(0, Math.min(100, timePercentage))}%` }}
                    />
                  </div>
                  
                  <div className="text-center">
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatTime(child.dailyAllowance)}
                    </p>
                    <p className="text-sm text-gray-800">Daily Allowance</p>
                  </div>

                  {/* Status Message */}
                  <div className="mt-6">
                    {canPlay ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-center gap-2 text-green-800">
                          <Gamepad2 className="h-5 w-5" />
                          <span className="font-semibold">You can play Xbox!</span>
                        </div>
                        <p className="text-green-700 text-sm mt-1">
                          Enjoy your {formatTime(child.currentTime)} of playtime
                        </p>
                      </div>
                    ) : (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center justify-center gap-2 text-red-800">
                          <Clock className="h-5 w-5" />
                          <span className="font-semibold">No Xbox time remaining</span>
                        </div>
                        <p className="text-red-700 text-sm mt-1">
                          Your time will reset tomorrow or you can earn more time through good behavior
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity History */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Changes to your Xbox time</CardDescription>
              </CardHeader>
              <CardContent>
                {timeEntries.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {timeEntries.map((entry) => (
                      <div key={entry.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {entry.type === "ADDITION" && <TrendingUp className="h-4 w-4 text-green-600" />}
                              {entry.type === "DEDUCTION" && <TrendingDown className="h-4 w-4 text-red-600" />}
                              {entry.type === "RESET" && <RotateCcw className="h-4 w-4 text-blue-600" />}
                              <span className={`font-semibold text-sm ${
                                entry.amount > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {entry.amount > 0 ? '+' : ''}{formatTime(Math.abs(entry.amount))}
                              </span>
                            </div>
                            <p className="text-sm text-gray-900 mb-1">{entry.reason}</p>
                            <p className="text-xs text-gray-700">
                              {formatDate(entry.createdAt)} • by {entry.createdBy.username}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <History className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-800 text-sm">No activity yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tips Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>💡 Tips to Earn More Xbox Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl mb-2">📚</div>
                <p className="text-sm font-semibold text-blue-900">Do Homework</p>
                <p className="text-xs text-blue-700">Complete assignments on time</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl mb-2">🧹</div>
                <p className="text-sm font-semibold text-green-900">Help with Chores</p>
                <p className="text-xs text-green-700">Keep your room clean</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl mb-2">😊</div>
                <p className="text-sm font-semibold text-purple-900">Good Behavior</p>
                <p className="text-xs text-purple-700">Listen and be respectful</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl mb-2">⭐</div>
                <p className="text-sm font-semibold text-yellow-900">Extra Effort</p>
                <p className="text-xs text-yellow-700">Go above and beyond</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 