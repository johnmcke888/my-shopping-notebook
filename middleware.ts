import { authMiddleware } from "@clerk/nextjs";
 
export default authMiddleware({
  publicRoutes: [
    "/",
    "/(auth)/*"  // This should catch all routes in the (auth) group
  ],
  afterAuth(auth, req) {
    const url = req.nextUrl.toString();
    
    // If they're authenticated and trying to access auth routes...
    if (auth.userId && url.includes('/(auth)')) {
      return Response.redirect(new URL('/(protected)/dashboard', req.url));
    }
  }
});
 
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};