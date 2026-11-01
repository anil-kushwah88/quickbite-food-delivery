import React, { useContext, useEffect, useState } from 'react'
import './PlaceOrder.css'
import { StoreContext, getErrorMessage } from '../../context/StoreContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const PlaceOrder = () => {

  const { getTotalCartAmount, token, food_list, cartItems, url, currency, deliveryFee, stripeEnabled, clearCart } = useContext(StoreContext)

  const [loading, setLoading] = useState(false)
  const [selectedMethod, setPaymentMethod] = useState(null)
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: ""
  })

  const navigate = useNavigate();
  const subtotal = getTotalCartAmount();

  // Default to online payment when it is available
  const paymentMethod = selectedMethod ?? (stripeEnabled ? "stripe" : "cod")

  useEffect(() => {
    if (!token) {
      toast.info("Please sign in to continue")
      navigate('/cart')
    } else if (food_list.length && subtotal === 0) {
      navigate('/cart')
    }
  }, [token, food_list.length, subtotal, navigate])

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData(data => ({ ...data, [name]: value }))
  }

  const placeOrder = async (event) => {
    event.preventDefault();

    // Only ids and quantities are sent – the server looks up real prices.
    const items = food_list
      .filter((item) => cartItems[item._id] > 0)
      .map((item) => ({ _id: item._id, quantity: cartItems[item._id] }));

    if (items.length === 0) return toast.info("Your cart is empty");

    setLoading(true)
    try {
      const response = await axios.post(
        url + "/api/order/place",
        { address: data, items, paymentMethod },
        { headers: { token } }
      );

      if (paymentMethod === "stripe") {
        window.location.replace(response.data.session_url);
      } else {
        clearCart();
        toast.success("Order placed! Pay with cash on delivery.");
        navigate('/myorders');
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not place order"));
      setLoading(false)
    }
  }

  const fee = subtotal === 0 ? 0 : deliveryFee;

  return (
    <form onSubmit={placeOrder} className='place-order'>
      <div className="placce-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input required name='firstName' onChange={onChangeHandler} value={data.firstName} type="text" placeholder='First Name' />
          <input required name='lastName' onChange={onChangeHandler} value={data.lastName} type="text" placeholder='Last Name' />
        </div>
        <input required name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Email address' />
        <input required name='street' onChange={onChangeHandler} value={data.street} type="text" placeholder='Street' />
        <div className="multi-fields">
          <input required name='city' onChange={onChangeHandler} value={data.city} type="text" placeholder='City' />
          <input required name='state' onChange={onChangeHandler} value={data.state} type="text" placeholder='State' />
        </div>
        <div className="multi-fields">
          <input required name='zipcode' onChange={onChangeHandler} value={data.zipcode} type="text" placeholder='Zip code' />
          <input required name='country' onChange={onChangeHandler} value={data.country} type="text" placeholder='Country' />
        </div>
        <input required name='phone' onChange={onChangeHandler} value={data.phone} type="tel" pattern="[0-9+\-\s]{7,15}" title="Enter a valid phone number" placeholder='Phone' />
      </div>
      <div className="placce-order-right">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>{currency}{subtotal.toFixed(2)}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>{currency}{fee.toFixed(2)}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>{currency}{(subtotal + fee).toFixed(2)}</b>
            </div>
          </div>

          <div className="payment-methods">
            <h3>Payment Method</h3>
            <label className={`payment-option ${paymentMethod === "stripe" ? "selected" : ""} ${!stripeEnabled ? "disabled" : ""}`}>
              <input type="radio" name="payment" value="stripe" disabled={!stripeEnabled}
                checked={paymentMethod === "stripe"} onChange={() => setPaymentMethod("stripe")} />
              Pay Online (Card via Stripe)
              {!stripeEnabled && <small>Not configured</small>}
            </label>
            <label className={`payment-option ${paymentMethod === "cod" ? "selected" : ""}`}>
              <input type="radio" name="payment" value="cod"
                checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} />
              Cash on Delivery
            </label>
          </div>

          <button type='submit' disabled={loading}>
            {loading ? "PLEASE WAIT..." : paymentMethod === "stripe" ? "PROCEED TO PAYMENT" : "PLACE ORDER"}
          </button>
        </div>
      </div>
    </form>
  )
}

export default PlaceOrder;
