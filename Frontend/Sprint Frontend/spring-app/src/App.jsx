import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import SprintForm from './components/sprint/SpringForm'
import './App.css'
import SprintDashboard from './components/sprint/SprintDashboard'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <SprintDashboard />
    </>
  )
}

export default App
