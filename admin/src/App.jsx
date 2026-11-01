import React, { useCallback, useEffect, useState } from 'react'
import Navbar from './components/Sidebar/Navbar/Navbar'
import Sidebar from './components/Sidebar/Sidebar'
import { Routes, Route, Navigate } from 'react-router-dom'
import Add from './pages/Add/Add'
import List from './pages/List/List'
import Orders from './pages/Orders/Orders'
import Dashboard from './pages/Dashboard/Dashboard'
import Login from './pages/Login/Login'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ADMIN_TOKEN_KEY, API_URL } from './api'

const App = () => {

  const url = API_URL
  const [token, setToken] = useState(() => localStorage.getItem(ADMIN_TOKEN_KEY) || "")

  const login = (newToken) => {
    localStorage.setItem(ADMIN_TOKEN_KEY, newToken)
    setToken(newToken)
  }

  const logout = useCallback((message) => {
    localStorage.removeItem(ADMIN_TOKEN_KEY)
    setToken("")
    if (message) toast.info(message)
  }, [])

  // Fired by the API client when the token is rejected
  useEffect(() => {
    const onExpired = () => logout("Session expired, please login again")
    window.addEventListener("admin-logout", onExpired)
    return () => window.removeEventListener("admin-logout", onExpired)
  }, [logout])

  return (
    <div>
      <ToastContainer position="top-right" autoClose={2500} />
      {!token ? (
        <Login onLogin={login} />
      ) : (
        <>
          <Navbar onLogout={() => logout("Logged out")} />
          <hr />
          <div className="app-content">
            <Sidebar />
            <Routes>
              <Route path="/" element={<Dashboard url={url} />} />
              <Route path="/add" element={<Add url={url} />} />
              <Route path="/list" element={<List url={url} />} />
              <Route path="/orders" element={<Orders url={url} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </>
      )}
    </div>
  )
}

export default App
