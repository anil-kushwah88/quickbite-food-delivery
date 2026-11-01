import React, { useState } from 'react'
import './Login.css'
import { assets } from '../../assets/admin_assets/assets'
import api, { getErrorMessage } from '../../api'
import { toast } from 'react-toastify'

const Login = ({ onLogin }) => {

  const [data, setData] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)

  const onChange = (e) => setData((d) => ({ ...d, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await api.post("/api/admin/login", data)
      onLogin(response.data.token)
      toast.success("Welcome, admin!")
    } catch (error) {
      toast.error(getErrorMessage(error, "Login failed"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='admin-login'>
      <form onSubmit={onSubmit} className='admin-login-card'>
        <img src={assets.logo} alt="Tomato" />
        <h2>Admin Panel</h2>
        <p>Sign in to manage the menu and orders</p>
        <input name='email' type="email" placeholder='Admin email' value={data.email} onChange={onChange} autoComplete='username' required />
        <input name='password' type="password" placeholder='Password' value={data.password} onChange={onChange} autoComplete='current-password' required />
        <button type='submit' disabled={loading}>{loading ? "Signing in..." : "Login"}</button>
      </form>
    </div>
  )
}

export default Login
