import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Home } from './pages/Home'
import { GramotaCaseStudy } from './pages/CaseStudyGramota'
import { initCal } from './lib/cal'

function App() {
  useEffect(() => {
    initCal()
  }, [])

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/case-studies/gramota" element={<GramotaCaseStudy />} />
    </Routes>
  )
}

export default App
