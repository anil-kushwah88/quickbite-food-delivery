import React, { useState, useContext, useRef, useEffect } from 'react'
import './Navbar.css'
import { assets } from '../../assets/frontend_assets/assets'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import { toast } from 'react-toastify';

const Navbar = ({ setShowLogin }) => {

  const [menu, setMenu] = useState("home");
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);

  const { getTotalCartItems, token, logout, searchQuery, setSearchQuery } = useContext(StoreContext);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (showSearch) searchRef.current?.focus();
  }, [showSearch]);

  const handleLogout = () => {
    logout();
    toast.info("Logged out");
    navigate("/");
  }

  // Section links work from any page
  const goToSection = (id, key) => {
    setMenu(key);
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  }

  const onSearch = (e) => {
    setSearchQuery(e.target.value);
    if (location.pathname !== "/") navigate("/");
    document.getElementById("food-display")?.scrollIntoView({ behavior: "smooth" });
  }

  const cartCount = getTotalCartItems();

  return (
    <div className='navbar'>
      <Link to='/' onClick={() => setMenu("home")}><img src={assets.logo} alt="Tomato" className='logo' /></Link>
      <ul className="navbar-menu">
        <Link to='/' onClick={() => { setMenu("home"); window.scrollTo({ top: 0, behavior: "smooth" }) }} className={menu === "home" ? "active" : ""}>home</Link>
        <a onClick={() => goToSection("explore-menu", "menu")} className={menu === "menu" ? "active" : ""}>menu</a>
        <a onClick={() => goToSection("app-download", "mobile-app")} className={menu === "mobile-app" ? "active" : ""}>mobile-app</a>
        <a onClick={() => goToSection("footer", "contact-us")} className={menu === "contact-us" ? "active" : ""}>contact us</a>
      </ul>
      <div className='navbar-right'>
        <div className={`navbar-search ${showSearch ? "open" : ""}`}>
          {showSearch && (
            <input
              ref={searchRef}
              value={searchQuery}
              onChange={onSearch}
              onBlur={() => !searchQuery && setShowSearch(false)}
              onKeyDown={(e) => e.key === "Escape" && (setSearchQuery(""), setShowSearch(false))}
              placeholder="Search dishes..."
            />
          )}
          <img src={assets.search_icon} alt="Search" onClick={() => setShowSearch((s) => !s)} />
        </div>
        <div className="navbar-search-icon">
          <Link to='/cart'><img src={assets.basket_icon} alt="Cart" /></Link>
          {cartCount > 0 && <div className="dot">{cartCount}</div>}
        </div>
        {!token ? <button onClick={() => setShowLogin(true)}>sign in</button>
          : <div className='navbar-profile'>
            <img src={assets.profile_icon} alt="Profile" />
            <ul className="nav-profile-dropdown">
              <li onClick={() => navigate('/myorders')}><img src={assets.bag_icon} alt="" /><p>Orders</p></li>
              <hr />
              <li onClick={handleLogout}><img src={assets.logout_icon} alt="" /><p>Logout</p></li>
            </ul>
          </div>}
      </div>
    </div>
  )
}

export default Navbar;
