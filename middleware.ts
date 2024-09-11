import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server';

//in our app the home page is accessible by any user(whther logged in or not)
//on home page videos are seen. That is its is coming from an api

//other sections are social share and upoad video
//that only loggedin user can do
//therefore we will have public routes and matcher with them

const isPublicRoute = createRouteMatcher([
  "/home",
  "/sign-in",
  "/sign-up",
  "/"
])

//the only public api route
const isPublicApiRoute = createRouteMatcher([
  "/api/videos"
])


//this thing has a callback where u can write your logic  as per your need
//get the current url match it if whether user is trying to access a protected route or not
//if yes redirect the user to appropriate place
//if logged in and trying to access public route redirect to home
//if not logged in and trying to access protected route redirect to login
export default clerkMiddleware((auth, req)=>{

  const {userId} = auth();
  const currentUrl = new URL(req.url);
  
  const isAccessingHomePage = currentUrl.pathname === "/home"

  //includes every api route
  const isAccessingApi = currentUrl.pathname.startsWith("/api")

  
   //the case where the user is trying to acces signin/signup page even after logged in
    if( userId && isPublicRoute(req) && !isAccessingHomePage){
      return NextResponse.redirect(new URL("/home", req.url))
    }

    //not loggedin
    if(!userId){
      //if user is not  logged and trying to access protected routes
      //means he is trying to acces to social share and upload videos route
      if(!isPublicRoute(req) && !isPublicApiRoute(req)){
        return NextResponse.redirect(new URL("/sign-in", req.url))
      }

      //if user is not logged in and trying to acces a protected api route
      //only public api route is /api/videos
      // other than this every route is protected
      if(!isPublicApiRoute(req) && isAccessingApi){
        return NextResponse.redirect(new URL("/sign-in", req.url))
      }

      
    }

  

  return NextResponse.next();
  
})

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
