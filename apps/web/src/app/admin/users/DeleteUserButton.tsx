"use client"

import React from "react"
import { useRouter } from "next/navigation"

export function DeleteUserButton({ userId, userName }: { userId: string, userName: string }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleDelete = async () => {
    if (!window.confirm(`Are you absolutely sure you want to delete ${userName}? This will permanently delete their account and all their authored content.`)) {
      return
    }

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || "Failed to delete user")
        setIsDeleting(false)
      }
    } catch (error) {
      alert("An unexpected error occurred while deleting")
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-700 p-1.5 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center justify-center cursor-pointer"
      title="Delete User"
    >
      {isDeleting ? (
        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      )}
    </button>
  )
}
