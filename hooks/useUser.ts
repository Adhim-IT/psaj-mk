"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

export function useUser() {
  const { data: session, status } = useSession()
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    image: "",
  })

  useEffect(() => {
    if (session?.user) {
      setUserData({
        name: session.user.name || "",
        email: session.user.email || "",
        image: session.user.image || "",
      })
    }
  }, [session])

  const updateUserData = (newData: Partial<typeof userData>) => {
    setUserData((prevData) => ({ ...prevData, ...newData }))
  }

  return {
    user: userData,
    updateUser: updateUserData,
    isAuthenticated: status === "authenticated",
    status,
  }
}

