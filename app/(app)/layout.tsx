"use client"
import { useClerk, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import {
  LogOutIcon,
  MenuIcon,
  LayoutDashboardIcon,
  Share2Icon,
  UploadIcon,
  ImageIcon
} from "lucide-react";
//useUser can extract moe informations like email addess. etc...


//generate the side bar

const sidebarItems = [
  { href: "/home", label: "Home", icon: LayoutDashboardIcon },
  { href: "/social-share", label: "Social Share", icon: Share2Icon },
  { href: "/upload-video", label: "Upload Video", icon: UploadIcon },
]

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();
  const { user } = useClerk();

  //on click of logo redirect to home page

  const handleLogoClick = () => {
    router.push("/");
  }
  const handleLoginClick = () =>{
    router.push("/sign-in")
  }

  const handleSignOut = async () => {
    await signOut();
    router.push("/home")
  }
  return (
    <div className="drawer lg:drawer-open">
      <input
        id="sidebar-drawer"
        type="checkbox"
        className="drawer-toggle bg-black border border-r-slate-400"
        checked={sidebarOpen}
        onChange={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="drawer-content flex flex-col">
        {/* Navbar */}
        <header className="w-full bg-black border-b border-b-slate-800 ">
          <div className="navbar max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            {/* Mobile Menu Icon */}
            <div className="flex-none lg:hidden">
              <label
                htmlFor="sidebar-drawer"
                className="btn btn-square btn-ghost drawer-button"
              >
                <MenuIcon />
              </label>
            </div>

            {/* Logo Section */}
            <div className="flex-1">
              <Link href="/" onClick={handleLogoClick}>
                <div className="flex items-center space-x-2 cursor-pointer">
                  <span className="text-primary text-3xl font-extrabold tracking-tight">
                   Social Sizer
                  </span>
                </div>
              </Link>
            </div>

            {/* User Profile and Sign Out */}
            <div className="flex-none flex items-center space-x-4">
              {user ? (
                <>
                  <div className="avatar">
                    <div className="w-10 h-10 rounded-full border border-base-300">
                      <img
                        src={user.imageUrl}
                        alt={user.username || user.emailAddresses[0].emailAddress}
                        className="object-cover"
                      />
                    </div>
                  </div>

                  <span className="hidden md:block text-sm truncate max-w-xs lg:max-w-md font-medium text-base-content">
                    {user.username || user.emailAddresses[0].emailAddress}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="btn btn-outline btn-error btn-circle"
                  >
                    <LogOutIcon className="h-5 w-5" />
                  </button>
                </>
              ):(
                <>
                <button 
                className="btn btn-primary text-center"
                        onClick={handleLoginClick}
                >Login</button>
                </>
              )}
            </div>


          </div>
        </header>

        {/* PageContent */}
        <main className="flex-grow">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 my-5 md:my-0 ">
            {children}
          </div>
        </main>

      </div>

      <div className="drawer-side">
        <label htmlFor="sidebar-drawer" className="drawer-overlay"></label>
        <aside className="w-64 bg-black border-r border-r-slate-600 h-full flex flex-col">
          <div className="flex items-center justify-center py-4">
            <ImageIcon className="w-10 h-10 text-primary" />
          </div>
          <ul className="p-4 menu w-full flex-grow text-base-content">
            {
              sidebarItems.map((item) => (
                <li key={item.href} className="mb-2">
                  <Link href={item.href} className={
                    `flex items-center space-x-4 px-4 py-2 rounded-lg ${pathname === item.href ? "bg-primary text-white" : "hover:bg-base-300"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="w-6 h-6" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
          </ul>

          {
            user && (
              <div className="p-4">
                <button
                  className="btn btn-outline btn-error w-full"
                  onClick={handleSignOut}
                >
                  <LogOutIcon className="h-5 w-5 mr-2" />
                  Sign out
                </button>
              </div>
            )
          }
        </aside>
      </div>
    </div>
  )
}