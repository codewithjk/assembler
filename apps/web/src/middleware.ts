import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const PUBLIC_ROUTES = ['/', '/login(.*)', '/signup(.*)', '/api/webhooks(.*)'];

const isPublicRoute = createRouteMatcher(PUBLIC_ROUTES)

// const isProtectedRoute = createRouteMatcher(['/home(.*)'])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // If logged in and on try to request public route, redirect to "/home"
  if (userId && isPublicRoute(req) ) {
    return Response.redirect(new URL('/home', req.nextUrl));
  }

  // Protect all non-public routes
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
  })

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}