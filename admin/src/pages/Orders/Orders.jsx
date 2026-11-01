import React, { useState, useEffect, useCallback } from 'react'
import './Orders.css'
import { toast } from 'react-toastify'
import { assets } from '../../assets/admin_assets/assets'
import api, { CURRENCY, getErrorMessage } from '../../api'

const STATUSES = ["Food Processing", "Out for delivery", "Delivered", "Cancelled"]

const formatDate = (iso) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

const Orders = () => {

  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const fetchAllOrders = useCallback(async () => {
    try {
      const response = await api.get("/api/order/list", {
        params: filter === "All" ? {} : { status: filter },
      });
      setOrders(response.data.data);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not load orders"))
    } finally {
      setLoading(false)
    }
  }, [filter])

  const statusHandler = async (event, orderId) => {
    try {
      await api.post("/api/order/status", { orderId, status: event.target.value })
      toast.success("Order status updated")
      await fetchAllOrders();
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not update status"))
    }
  }

  useEffect(() => {
    fetchAllOrders()
  }, [fetchAllOrders])

  return (
    <div className='order add'>
      <div className="order-header">
        <h3>Order Page</h3>
        <div className="order-actions">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="All">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={fetchAllOrders}>Refresh</button>
        </div>
      </div>
      <div className="order-list">
        {loading && <p>Loading orders...</p>}
        {!loading && orders.length === 0 && <p className="order-empty">No orders found.</p>}
        {orders.map((order) => (
          <div key={order._id} className='order-item'>
            <img src={assets.parcel_icon} alt="" />
            <div>
              <p className='order-item-food'>
                {order.items.map((item) => `${item.name} x ${item.quantity}`).join(", ")}
              </p>
              <p className='order-item-name'>{order.address.firstName + " " + order.address.lastName}</p>
              <div className="order-item-address">
                <p>{order.address.street + ","}</p>
                <p>{[order.address.city, order.address.state, order.address.country, order.address.zipcode].join(", ")}</p>
              </div>
              <p className='order-item-phone'>{order.address.phone}</p>
              <p className='order-item-meta'>#{order._id.slice(-6).toUpperCase()} · {formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p>Items : {order.items.length}</p>
              <p className={`order-payment ${order.payment ? "paid" : "pending"}`}>
                {order.paymentMethod === "cod" ? "COD" : "Stripe"} · {order.payment ? "Paid" : "Pending"}
              </p>
            </div>
            <p><b>{CURRENCY}{Number(order.amount).toFixed(2)}</b></p>
            <select onChange={(event) => statusHandler(event, order._id)} value={order.status}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Orders;
