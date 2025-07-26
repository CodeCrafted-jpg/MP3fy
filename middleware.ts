// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server'; // Import NextResponse for manual redirection

const protectedRoutes = createRouteMatcher([
  '/',

]);

export default clerkMiddleware(async (auth, req) => { // <-- Mark the callback as async
  // If the current request path matches any of the protected routes
  if (protectedRoutes(req)) {
    console.log(`Checking protection for route: ${req.nextUrl.pathname}`);

    // Await the auth() call before destructuring its properties
    // This explicitly tells TypeScript to wait for the Promise to resolve
    // if it truly thinks auth() returns a Promise.
    const { userId, redirectToSignIn } = await auth(); // <-- Await auth()

    // If the user is NOT logged in (no userId), then redirect them to the sign-in page
    if (!userId) {
      console.log(`User not authenticated for ${req.nextUrl.pathname}. Redirecting to sign-in.`);
      // Use the redirectToSignIn function provided by Clerk
      return redirectToSignIn();
    }
    // If the user IS logged in, allow the request to proceed
    console.log(`User authenticated for ${req.nextUrl.pathname}. Proceeding.`);
  }

  // For routes that are not in protectedRoutes, or if the user is authenticated,
  // allow the request to proceed to the next middleware or page.
  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};