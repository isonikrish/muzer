"use client"
import StreamView from '@/components/StreamView';
import { useParams } from 'next/navigation'
import React from 'react'

function Creator() {
    const params = useParams()
    const id = params?.id
    if(!id) return <div>No id provided</div>

    let parsedId = parseInt(id as string)
  return (
    <div>
        <StreamView creatorId={parsedId} playVideo={false}/>
    </div>
  )
}

export default Creator