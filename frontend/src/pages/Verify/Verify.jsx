import React, { useContext, useEffect, useRef } from 'react'
import './Verify.css'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { StoreContext } from '../../context/StoreContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const Verify = () => {

  const [searchParams] = useSearchParams();
  const success = searchParams.get("success")
  const orderId = searchParams.get("orderId")
  const { url, token, clearCart } = useContext(StoreContext);
  const navigate = useNavigate();
  const verified = useRef(false);

  useEffect(() => {
    if (!token || verified.current) return;
    verified.current = true; // avoid double calls in React StrictMode

    const verifyPayment = async () => {
      try {
        const response = await axios.post(url + "/api/order/verify", { success, orderId }, { headers: { token } });
        if (response.data.success) {
          clearCart();
          toast.success("Payment successful! Your order is being prepared.");
          navigate("/myorders");
        } else {
          toast.error("Payment was cancelled. Your cart is still saved.");
          navigate("/cart");
        }
      } catch {
        toast.error("Could not verify payment");
        navigate("/");
      }
    }
    verifyPayment();
  }, [token, url, success, orderId, navigate, clearCart]);

  return (
    <div className='verify'>
      <div className="spinner"></div>
      <p>Verifying your payment...</p>
    </div>
  )
}

export default Verify
