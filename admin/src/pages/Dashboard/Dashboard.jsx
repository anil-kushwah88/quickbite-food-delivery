import React, { useEffect, useState } from 'react'
import './Dashboard.css'
import api, { CURRENCY, getErrorMessage } from '../../api'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'

const STATUSES = ["Food Processing", "Out for delivery", "Delivered", "Cancelled"]

const Dashboard = () => {

  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get("/api/admin/stats")
      .then((res) => setStats(res.data.data))
      .catch((error) => toast.error(getErrorMessage(error, "Could not load stats")))
  }, [])

  if (!stats) return <div className='dashboard'><p>Loading dashboard...</p></div>

  const cards = [
    { label: "Total Revenue", value: `${CURRENCY}${stats.revenue.toFixed(2)}` },
    { label: "Orders", value: stats.orders },
    { label: "Menu Items", value: stats.foods },
    { label: "Customers", value: stats.users },
  ]

  return (
    <div className='dashboard'>
      <h3>Dashboard</h3>

      <div className="dashboard-cards">
        {cards.map((c) => (
          <div key={c.label} className="dashboard-card">
            <p>{c.label}</p>
            <h2>{c.value}</h2>
          </div>
        ))}
      </div>

      <div className="dashboard-status">
        {STATUSES.map((s) => (
          <div key={s}>
            <span>{s}</span>
            <b>{stats.byStatus[s] || 0}</b>
          </div>
        ))}
      </div>

      <div className="dashboard-recent">
        <div className="dashboard-recent-header">
          <h4>Recent Orders</h4>
          <Link to="/orders">View all →</Link>
        </div>
        {stats.recentOrders.length === 0 && <p>No orders yet.</p>}
        {stats.recentOrders.map((o) => (
          <div key={o._id} className="dashboard-recent-row">
            <span>#{o._id.slice(-6).toUpperCase()}</span>
            <span>{o.address.firstName} {o.address.lastName}</span>
            <span>{o.items.length} items</span>
            <span>{CURRENCY}{Number(o.amount).toFixed(2)}</span>
            <span className='pill'>{o.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Dashboard
