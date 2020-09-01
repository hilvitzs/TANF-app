import React from 'react'
import { GovBanner } from '@trussworks/react-uswds'
import Routes from './components/Routes'
import { Notify } from './components/Notify'

import '@trussworks/react-uswds/lib/uswds.css'
import '@trussworks/react-uswds/lib/index.css'

import './App.scss'

function App() {
  return (
    <>
      <GovBanner
        aria-label="Official government website"
        className="gov-banner"
      />
      <Notify />
      <Routes />
    </>
  )
}

export default App
