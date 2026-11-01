import React, { useContext, useState } from 'react'
import './Cart.css'
import { StoreContext } from '../../context/StoreContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const Cart = ({ setShowLogin }) => {

  const { cartItems, food_list, removeFromCart, addToCart, getTotalCartAmount, url, currency, deliveryFee, token } = useContext(StoreContext)
  const [promo, setPromo] = useState("")

  const navigate = useNavigate();
  const subtotal = getTotalCartAmount();
  const fee = subtotal === 0 ? 0 : deliveryFee;
  const itemsInCart = food_list.filter((item) => cartItems[item._id] > 0);

  const proceedToCheckout = () => {
    if (subtotal === 0) return toast.info("Your cart is empty");
    if (!token) {
      toast.info("Please sign in to place your order");
      return setShowLogin(true);
    }
    navigate('/order');
  }

  const applyPromo = () => {
    if (!promo.trim()) return toast.info("Enter a promo code");
    toast.error("This promo code is invalid or expired");
  }

  return (
    <div className='cart'>
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />
        {itemsInCart.length === 0 && (
          <p className='cart-empty'>Your cart is empty. <span onClick={() => navigate('/')}>Browse the menu</span></p>
        )}
        {itemsInCart.map((item) => (
          <div key={item._id}>
            <div className='cart-items-title cart-items-item'>
              <img src={url + "/images/" + item.image} alt={item.name} />
              <p>{item.name}</p>
              <p>{currency}{item.price}</p>
              <div className='cart-qty'>
                <button onClick={() => removeFromCart(item._id)} aria-label="Decrease">−</button>
                <span>{cartItems[item._id]}</span>
                <button onClick={() => addToCart(item._id)} aria-label="Increase">+</button>
              </div>
              <p>{currency}{(item.price * cartItems[item._id]).toFixed(2)}</p>
              <p onClick={() => removeFromCart(item._id)} className='cross'>x</p>
            </div>
            <hr />
          </div>
        ))}
      </div>
      <div className="cart-bottom">
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
          <button onClick={proceedToCheckout}>PROCEED TO CHECKOUT</button>
        </div>
        <div className="cart-promocode">
          <div>
            <p>If you have a promo code, enter it here</p>
            <div className='cart-promocode-input'>
              <input type="text" placeholder='promo code' value={promo} onChange={(e) => setPromo(e.target.value)} />
              <button onClick={applyPromo}>Submit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
