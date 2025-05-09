"use client"
import React from 'react'
import { Button } from './ui/button'
import { signIn, signOut, useSession } from 'next-auth/react'

function Appbar() {
  const session = useSession()
  return (
    <div className="flex items-center justify-between px-5 py-3 border-b">
      <div className="text-2xl font-bold tracking-tight">
        Muzer
      </div>

      <div>
        {session?.data?.user ? <Button onClick={() => signOut()}>Logout</Button> :
          <Button onClick={() => signIn()}>Login</Button>}
      </div>
    </div>
  )
}

export default Appbar