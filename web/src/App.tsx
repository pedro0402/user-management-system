import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';


function App() {

  return (
    <Router>
      <Routes>
        <Route path='/login' element={
          <PublicRoute>
            <LoginPage/>
          </PublicRoute>
        } />
        <Route path='/' element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>} />
      </Routes>
    </Router>
  )
}

export default App
