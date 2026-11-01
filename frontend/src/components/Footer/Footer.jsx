import React from 'react'
import './Footer.css'
import { assets } from '../../assets/frontend_assets/assets'

const Footer = () => {
  return (
    <div className='footer' id='footer'>
        <div className="footer-content">
            <div className="footer-content-left">
               <img src={assets.logo} alt="Tomato" />
               <p>Tomato brings your favourite dishes from the best kitchens in town straight to your door. Fresh ingredients, fast delivery and secure payments, every single time.</p>
               <div className="footer-social-icons">
                <img src={assets.facebook_icon} alt="" />
                <img src={assets.twitter_icon} alt="" />
                <img src={assets.linkedin_icon} alt="" />
               </div>
            </div>

             <div className="footer-content-center">
                   <h2>COMPANY</h2>
                   <ul>
                    <li onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Home</li>
                    <li>About us</li>
                    <li>Delivery</li>
                    <li>Privacy policy</li>
                   </ul>
             </div>

            <div className="footer-content-right">
                     <h2>GET IN TOUCH</h2>
                     <ul>
                        <li>+1-212-456-7890</li>
                        <li>contact@tomato.com</li>
                     </ul>
            </div>

        </div>
         <hr />
         <p className="footer-copyright">Copyright {new Date().getFullYear()} © Tomato.com - All Rights Reserved. </p>
    </div>

  )
}

export default Footer
