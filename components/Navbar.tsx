import React from 'react';
import { SignedIn, SignInButton, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';

const Navbar = () => {
  return (
    <nav className="fixed top-0 z-50 flex w-full items-center justify-between border-b bg-gradient-to-br from-violet-500 to-pink-500 px-6 py-3 shadow-md lg:px-10">
      {/* Logo and title */}
      <Link href="/" className="flex items-center gap-2">
         <div className="size-7 rounded-full bg-gradient-to-br from-violet-700 to-pink-700" />
        <p className="text-xl font-extrabold text-white sm:text-2xl">MP3fy</p>
      </Link>
      

      {/* Auth Buttons */}
      <div className="flex items-center gap-4">
        <Link href={"/Download"}><button>⬇️</button></Link>
         <Link href={"/converter"}><button>▶️</button></Link>
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>

      
      </div>

    </nav>
  );
};

export default Navbar;
