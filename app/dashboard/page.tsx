import StreamView from '@/components/StreamView'
import React from 'react'

function Dashboard() {

  return (
    <div>
      <StreamView creatorId={1} playVideo={true}/>
    </div>
  )
}

export default Dashboard