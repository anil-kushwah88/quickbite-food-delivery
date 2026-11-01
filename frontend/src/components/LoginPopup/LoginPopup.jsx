import React, { useState, useContext, useEffect } from 'react'
import './LoginPopup.css'
import { assets } from '../../assets/frontend_assets/assets'
import { StoreContext, getErrorMessage } from '../../context/StoreContext'
import axios from "axios"
import { toast } from 'react-toastify'

const LoginPopup = ({ setShowLogin }) => {

  const { url, setToken, loadCartData, cartItems } = useContext(StoreContext)

  const [currState, setCurrState] = useState("Login")
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState({
    name: "",
    email: "",
    password: ""
  })

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setShowLogin(false)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [setShowLogin])

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData(data => ({ ...data, [name]: value }))
  }

  const onLogin = async (event) => {
    event.preventDefault()
    const endpoint = currState === "Login" ? "/api/user/login" : "/api/user/register"
    const payload = currState === "Login" ? { email: data.email, password: data.password } : data

    setLoading(true)
    try {
      const response = await axios.post(url + endpoint, payload);
      setToken(response.data.token);
      await loadCartData(response.data.token, cartItems);
      toast.success(currState === "Login" ? `Welcome back, ${response.data.user.name}!` : "Account created successfully")
      setShowLogin(false)
    } catch (error) {
      toast.error(getErrorMessage(error, "Authentication failed"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='login-popup' onClick={(e) => e.target === e.currentTarget && setShowLogin(false)}>
      <form onSubmit={onLogin} className='login-popup-container'>
        <div className="login-popup-title">
          <h2>{currState}</h2>
          <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="Close" />
        </div>
        <div className="login-popup-inputs">
          {currState === "Login" ? <></> : <input name='name' onChange={onChangeHandler} value={data.name} type="text" placeholder='Your name' required />}
          <input name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Your email' autoComplete='email' required />
          <input name='password' onChange={onChangeHandler} value={data.password} type="password" placeholder={currState === "Login" ? 'Password' : 'Password (min 8 characters)'} minLength={currState === "Login" ? undefined : 8} autoComplete={currState === "Login" ? 'current-password' : 'new-password'} required />
        </div>
        <button type='submit' disabled={loading}>
          {loading ? "Please wait..." : currState === "Sign Up" ? "Create account" : "Login"}
        </button>
        <div className="login-popup-condition">
          <input type="checkbox" required />
          <p>By continuing, I agree to the terms of use & privacy policy.</p>
        </div>
        {currState === "Login"
          ? <p>Create a new account? <span onClick={() => setCurrState("Sign Up")}>Click here</span></p>
          : <p>Already have an account? <span onClick={() => setCurrState("Login")}>Login here</span></p>
        }
      </form>
    </div>
  )
}

export default LoginPopup;
