import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import { ProfilePage } from './pages/ProfilePage';
import { UsersPage } from './pages/UsersPage';


function App() {

  return (
    <Router>
      <Routes>
        <Route path='/login' element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />
        <Route path='/' element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>} />
        <Route path='/profile' element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>} />
        <Route path='/users' element={
          <PrivateRoute>
            <UsersPage />
          </PrivateRoute>} />
      </Routes>
    </Router>
  )
}

export default App
