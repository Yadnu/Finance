import React from 'react'
import HeaderLogo from './HeaderLogo'
import Navigation from './Navigation'
import { UserButton, ClerkLoaded, ClerkLoading } from '@clerk/nextjs'
import { Loader2 } from 'lucide-react'
import WelcomeMsg from './welcomeMsg'

const Header = () => {
  return (
    <header className="bg-gradient-to-b from-blue-700 to-blue-500 px-4 py-8 lg:px-14 pb-36">
        <div className="max-w-screen-2xl mx-auto">
            <div className='w-full flex items-center justify-between mb-14'>
                <div>
                    <div className="flex items-center lg:gap-x-16">
                        <HeaderLogo />
                        <Navigation />
                    </div>
                    <ClerkLoaded>
                    <UserButton afterSignOutUrl='/' />
                    </ClerkLoaded>
                    <ClerkLoading>
                        <Loader2 className='size-8 animate-spin text-slate-400' />
                    </ClerkLoading>
                    <WelcomeMsg />
                </div>

            </div>
        </div>
    </header>
  )
}

export default Header