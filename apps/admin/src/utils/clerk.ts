import {auth, currentUser} from "@clerk/nextjs/server"

export async function getCurrentUser() {
  const { userId } = await auth()
  
  if (!userId) {
    return null
  }

  return await currentUser()
}

export async function checkAuth() {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error("Unauthorized")
  }
  
  return userId
}