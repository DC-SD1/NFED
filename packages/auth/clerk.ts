import { auth } from "@clerk/nextjs/server";

export async function getSessionUser() {
  const { sessionClaims } = await auth();
  return sessionClaims?.user;
}
