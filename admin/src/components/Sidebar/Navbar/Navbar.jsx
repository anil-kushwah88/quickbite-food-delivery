import React from 'react'
import './Navbar.css'
import { assets } from '../../../assets/admin_assets/assets'

const Navbar = ({ onLogout }) => {
  return (
    <div className='navbar'>
      <img className='logo' src={assets.logo} alt="Tomato Admin" />
      <div className='navbar-right'>
        <img className='profile' src={assets.profile_image} alt="Admin" />
        <button onClick={onLogout}>Logout</button>
      </div>
    </div>
  )
}

export default Navbar
