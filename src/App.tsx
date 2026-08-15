import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import HomePage from './pages/HomePage'
import GamePage from './pages/GamePage'
import LevelPage from './pages/LevelPage'
import LearningPage from './pages/LearningPage'

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/learning" element={<LearningPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/level/:levelId" element={<LevelPage />} />
      </Route>
    </Routes>
  )
}

export default App
