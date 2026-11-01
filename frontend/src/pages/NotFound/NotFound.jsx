import React from 'react'
import { Link } from 'react-router-dom'
import './NotFound.css'

const NotFound = () => (
  <div className='not-found'>
    <h1>404</h1>
    <p>Oops! The page you're looking for doesn't exist.</p>
    <Link to='/'>Back to home</Link>
  </div>
)

export default NotFound
