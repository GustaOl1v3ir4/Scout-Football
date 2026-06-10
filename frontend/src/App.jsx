import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Explorador from './pages/Explorador'
import Tendencias from './pages/Tendencias'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950 text-white">
        <Navbar />
        <main className="max-w-6xl mx-auto px-6 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explorador" element={<Explorador />} />
            <Route path="/tendencias" element={<Tendencias />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App