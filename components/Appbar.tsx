"use client"
import React from 'react'
import { Button } from './ui/button'
import { signIn } from 'next-auth/react'

function Appbar() {
  return (
    <div className="flex items-center justify-between px-5 py-3 border-b">
      <div className="text-2xl font-bold tracking-tight">
        Muzer
      </div>

      <div>
        <Button onClick={()=>signIn()}>Login</Button>
      </div>
    </div>
  )
}

export default Appbar