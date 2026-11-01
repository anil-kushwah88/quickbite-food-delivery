import React, { useContext, useEffect, useState, useCallback } from 'react'
import './MyOrders.css'
import { StoreContext, getErrorMessage } from '../../context/StoreContext';
import axios from 'axios';
import { assets } from '../../assets/frontend_assets/assets';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const formatDate = (iso) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

const MyOrders = ({ setShowLogin }) => {

  const { url, token, currency } = useContext(StoreContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(Boolean(token));
  const navigate = useNavigate();

  const fetchOrders = useCallback(async (showToast = false) => {
    try {
      const response = await axios.post(url + "/api/order/userorders", {}, { headers: { token } });
      setData(response.data.data || []);
      if (showToast) toast.info("Order status refreshed");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not load orders"));
    } finally {
      setLoading(false);
    }
  }, [url, token]);

  useEffect(() => {
    if (token) fetchOrders();
    else setShowLogin?.(true);
  }, [token, fetchOrders, setShowLogin])

  return (
    <div className='my-orders'>
      <h2>My Orders</h2>
      <div className="container">
        {loading && <p className='my-orders-empty'>Loading your orders...</p>}
        {!loading && !token && <p className='my-orders-empty'>Please sign in to see your orders.</p>}
        {!loading && token && data.length === 0 && (
          <p className='my-orders-empty'>You haven't placed any orders yet. <span onClick={() => navigate('/')}>Order something tasty</span></p>
        )}
        {data.map((order) => (
          <div key={order._id} className="my-orders-order">
            <img src={assets.parcel_icon} alt="" />
            <p>
              {order.items.map((item) => `${item.name} x ${item.quantity}`).join(", ")}
              <small>{formatDate(order.createdAt)} · #{order._id.slice(-6).toUpperCase()}</small>
            </p>
            <p>{currency}{Number(order.amount).toFixed(2)}</p>
            <p>Items: {order.items.length}</p>
            <p className={`status-${order.status.split(" ")[0].toLowerCase()}`}>
              <span>&#x25cf;</span> <b>{order.status}</b>
              <small>{order.paymentMethod === "cod" ? "Cash on Delivery" : "Paid Online"}{order.payment ? " · Paid" : " · Pending"}</small>
            </p>
            <button onClick={() => fetchOrders(true)}>Track Order</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyOrders
