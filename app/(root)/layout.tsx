import Navbar from '@/components/Navbar'
import React, { ReactNode } from 'react'

const layout = ({children}: Readonly<{children: ReactNode}>) => {
  return (
      <main className="relative">
      <Navbar />

      
       
        
        <section className="flex min-h-screen flex-1 flex-col px-6 pb-6 pt-28 max-md:pb-14 sm:px-14">
          
          <div className="w-full">{children}</div>
        </section>
      
    </main>
  )
}

export default layout