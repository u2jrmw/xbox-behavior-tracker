"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
// import { Alert, AlertDescription } from "@/components/ui/alert"
import { Gamepad2, Clock, Minus, Plus, RotateCcw, UserPlus, LogOut, Trash2 } from "lucide-react"

interface Child {
  id: string
  name: string
  username: string
  dailyAllowance: number
  currentTime: number
  lastReset: string
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

export default function ParentDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddChild, setShowAddChild] = useState(false)
  const [newChild, setNewChild] = useState({
    name: "",
    username: "",
    password: "",
    dailyAllowance: 180
  })

  useEffect(() => {
    if (status === "loading") return
    
    if (!session || session.user.role !== "PARENT") {
      router.push("/login")
      return
    }

    fetchChildren()
  }, [session, status, router])

  const fetchChildren = async () => {
    try {
      const response = await fetch("/api/children")
      if (response.ok) {
        const data = await response.json()
        setChildren(data)
      }
    } catch (error) {
      console.error("Error fetching children:", error)
    } finally {
      setLoading(false)
    }
  }

  const addChild = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    try {
      console.log("Adding child:", newChild)
      const response = await fetch("/api/children", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newChild)
      })

      console.log("Response status:", response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log("Child added successfully:", result)
        await fetchChildren()
        setNewChild({ name: "", username: "", password: "", dailyAllowance: 180 })
        setShowAddChild(false)
      } else {
        const errorData = await response.json()
        console.error("Error response:", errorData)
        alert(`Error: ${errorData.error || 'Failed to add child'}`)
      }
    } catch (error) {
      console.error("Error adding child:", error)
      alert('Network error occurred while adding child')
    }
  }

  const adjustTime = async (childId: string, amount: number, reason: string, type: "DEDUCTION" | "ADDITION") => {
    try {
      const response = await fetch("/api/time-entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          childId,
          amount: Math.abs(amount),
          reason,
          type
        })
      })

      if (response.ok) {
        await fetchChildren()
      }
    } catch (error) {
      console.error("Error adjusting time:", error)
    }
  }

  const resetDaily = async (childId: string) => {
    try {
      const response = await fetch("/api/reset-daily", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ childId })
      })

      if (response.ok) {
        await fetchChildren()
      }
    } catch (error) {
      console.error("Error resetting daily allowance:", error)
    }
  }

  const deleteChild = async (childId: string, childName: string) => {
    const confirmed = confirm(
      `Are you sure you want to delete ${childName}'s profile?\n\n` +
      `This will permanently delete:\n` +
      `• All their Xbox time history\n` +
      `• Their login account (if they have one)\n` +
      `• All behavior tracking records\n\n` +
      `This action cannot be undone.`
    )

    if (!confirmed) return

    try {
      const response = await fetch(`/api/children?childId=${childId}`, {
        method: "DELETE"
      })

      if (response.ok) {
        await fetchChildren()
        alert(`${childName}'s profile has been deleted successfully.`)
      } else {
        const errorData = await response.json()
        alert(`Error deleting child: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error("Error deleting child:", error)
      alert('Network error occurred while deleting child')
    }
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Gamepad2 className="h-12 w-12 text-indigo-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-700">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <Gamepad2 className="h-8 w-8 text-indigo-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Parent Dashboard</h1>
                             <p className="text-gray-700">Welcome back, {session?.user.username}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setShowAddChild(true)} className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add Child
            </Button>
            <Button variant="outline" onClick={() => signOut()} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Add Child Form */}
        {showAddChild && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Add New Child</CardTitle>
              <CardDescription>Create a profile for your child to track their Xbox time</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={addChild} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Child's Name</Label>
                    <Input
                      id="name"
                      value={newChild.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewChild({...newChild, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={newChild.username}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewChild({...newChild, username: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password (optional)</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newChild.password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewChild({...newChild, password: e.target.value})}
                      placeholder="Leave empty if child won&apos;t login"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="allowance">Daily Allowance (minutes)</Label>
                    <Input
                      id="allowance"
                      type="number"
                      value={newChild.dailyAllowance}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewChild({...newChild, dailyAllowance: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Add Child</Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddChild(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Children Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {children.map((child) => (
            <ChildCard
              key={child.id}
              child={child}
              onAdjustTime={adjustTime}
              onResetDaily={resetDaily}
              onDeleteChild={deleteChild}
              formatTime={formatTime}
            />
          ))}
        </div>

        {children.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Gamepad2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No children added yet</h3>
                             <p className="text-gray-800 mb-4">Add your first child to start tracking their Xbox time</p>
              <Button onClick={() => setShowAddChild(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Child
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function ChildCard({ 
  child, 
  onAdjustTime, 
  onResetDaily, 
  onDeleteChild,
  formatTime 
}: { 
  child: Child
  onAdjustTime: (childId: string, amount: number, reason: string, type: "DEDUCTION" | "ADDITION") => void
  onResetDaily: (childId: string) => void
  onDeleteChild: (childId: string, childName: string) => void
  formatTime: (minutes: number) => string
}) {
  const [reason, setReason] = useState("")
  const [amount, setAmount] = useState(5)

  const handleDeduction = () => {
    if (reason.trim()) {
      onAdjustTime(child.id, amount, reason, "DEDUCTION")
      setReason("")
    }
  }

  const handleAddition = () => {
    if (reason.trim()) {
      onAdjustTime(child.id, amount, reason, "ADDITION")
      setReason("")
    }
  }

  const timePercentage = (child.currentTime / child.dailyAllowance) * 100
  const timeColor = child.currentTime <= 30 ? "bg-red-500" : child.currentTime <= 60 ? "bg-yellow-500" : "bg-green-500"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{child.name}</span>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-500" />
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDeleteChild(child.id, child.name)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              title={`Delete ${child.name}'s profile`}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </CardTitle>
        <CardDescription>@{child.username}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Time Display */}
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {formatTime(child.currentTime)}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className={`h-2 rounded-full transition-all ${timeColor}`} 
              style={{ width: `${Math.max(0, Math.min(100, timePercentage))}%` }}
            />
          </div>
          <p className="text-sm text-gray-800">
            Daily allowance: {formatTime(child.dailyAllowance)}
          </p>
        </div>

        {/* Time Adjustment */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Reason for change..."
              value={reason}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReason(e.target.value)}
              className="flex-1 placeholder:text-gray-500"
            />
            <Input
              type="number"
              value={amount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(parseInt(e.target.value) || 5)}
              className="w-20"
              min="1"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleDeduction} 
              disabled={!reason.trim()}
              variant="destructive"
              className="flex-1"
            >
              <Minus className="h-4 w-4 mr-1" />
              Remove
            </Button>
            <Button 
              onClick={handleAddition} 
              disabled={!reason.trim()}
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
            <Button 
              onClick={() => onResetDaily(child.id)}
              variant="outline"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Recent Entries */}
        {child.timeEntries.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-900">Recent Changes</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {child.timeEntries.slice(0, 3).map((entry) => (
                <div key={entry.id} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                  <span className="flex-1 truncate text-gray-800">{entry.reason}</span>
                  <span className={`font-semibold ${entry.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {entry.amount > 0 ? '+' : ''}{formatTime(Math.abs(entry.amount))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 