import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher(['/'])  // The root (/) is now public

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req) && !auth.userId) {
    auth().protect()
  }
})

export const config = {
  matcher: [
    '/((?!.+\\.[\\w]+$|_next).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
}