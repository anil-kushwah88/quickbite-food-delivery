import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const StoreContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const TOKEN_KEY = "token";

const readToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
};

export const getErrorMessage = (error, fallback = "Something went wrong") =>
  error?.response?.data?.message || error?.message || fallback;

const StoreContextProvider = ({ children }) => {
  const url = API_URL;
  const currency = "$";

  const [token, setTokenState] = useState(readToken);
  const [cartItems, setCartItems] = useState({});
  const [food_list, setFoodList] = useState([]);
  const [foodLoading, setFoodLoading] = useState(true);
  const [foodError, setFoodError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [checkoutConfig, setCheckoutConfig] = useState({ stripeEnabled: false, deliveryFee: 2 });

  const authHeaders = useMemo(() => ({ headers: { token } }), [token]);

  const setToken = useCallback((value) => {
    setTokenState(value);
    try {
      if (value) localStorage.setItem(TOKEN_KEY, value);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const logout = useCallback(() => {
    setToken("");
    setCartItems({});
  }, [setToken]);

  const addToCart = async (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
    if (!token) return;
    try {
      await axios.post(`${url}/api/cart/add`, { itemId }, authHeaders);
    } catch (error) {
      setCartItems((prev) => ({ ...prev, [itemId]: Math.max((prev[itemId] || 1) - 1, 0) }));
      toast.error(getErrorMessage(error, "Could not add item"));
    }
  };

  const removeFromCart = async (itemId) => {
    setCartItems((prev) => {
      const next = { ...prev };
      if (next[itemId] > 1) next[itemId] -= 1;
      else delete next[itemId];
      return next;
    });
    if (!token) return;
    try {
      await axios.post(`${url}/api/cart/remove`, { itemId }, authHeaders);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not update cart"));
    }
  };

  const clearCart = () => setCartItems({});

  const getTotalCartAmount = () => {
    let total = 0;
    for (const id in cartItems) {
      if (cartItems[id] > 0) {
        const item = food_list.find((product) => product._id === id);
        if (item) total += item.price * cartItems[id];
      }
    }
    return Math.round(total * 100) / 100;
  };

  const getTotalCartItems = () =>
    Object.entries(cartItems).reduce(
      (sum, [id, qty]) => (food_list.some((f) => f._id === id) ? sum + qty : sum),
      0
    );

  const fetchFoodList = async () => {
    setFoodLoading(true);
    setFoodError("");
    try {
      const response = await axios.get(`${url}/api/food/list`);
      setFoodList(response.data.data || []);
    } catch (error) {
      setFoodError(getErrorMessage(error, "Could not load the menu. Is the backend running?"));
    } finally {
      setFoodLoading(false);
    }
  };

  // Loads the saved cart, merging anything added while logged out.
  const loadCartData = useCallback(
    async (authToken, guestCart = {}) => {
      try {
        const headers = { headers: { token: authToken } };
        const response = Object.keys(guestCart).length
          ? await axios.post(`${url}/api/cart/sync`, { cartData: guestCart }, headers)
          : await axios.post(`${url}/api/cart/get`, {}, headers);
        setCartItems(response.data.cartData || {});
      } catch (error) {
        if (error?.response?.status === 401) {
          logout();
          toast.info("Your session expired, please sign in again");
        }
      }
    },
    [url, logout]
  );

  useEffect(() => {
    fetchFoodList();
    axios
      .get(`${url}/api/order/config`)
      .then((res) => setCheckoutConfig(res.data.data))
      .catch(() => {});
    const saved = readToken();
    if (saved) loadCartData(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contextValue = {
    url,
    currency,
    food_list,
    foodLoading,
    foodError,
    fetchFoodList,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    clearCart,
    getTotalCartAmount,
    getTotalCartItems,
    loadCartData,
    token,
    setToken,
    logout,
    searchQuery,
    setSearchQuery,
    deliveryFee: checkoutConfig.deliveryFee,
    stripeEnabled: checkoutConfig.stripeEnabled,
  };

  return <StoreContext.Provider value={contextValue}>{children}</StoreContext.Provider>;
};

export default StoreContextProvider;
