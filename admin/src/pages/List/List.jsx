import React, { useState, useEffect, useCallback } from 'react'
import './List.css'
import api, { CURRENCY, getErrorMessage } from '../../api'
import { toast } from "react-toastify"

const List = ({ url }) => {

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchList = useCallback(async () => {
    try {
      const response = await api.get("/api/food/list");
      setList(response.data.data);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not load foods"));
    } finally {
      setLoading(false);
    }
  }, [])

  const removeFood = async (food) => {
    if (!window.confirm(`Remove "${food.name}" from the menu?`)) return;
    try {
      const response = await api.post("/api/food/remove", { id: food._id });
      setList((prev) => prev.filter((f) => f._id !== food._id));
      toast.success(response.data.message)
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not remove food"));
    }
  }

  useEffect(() => {
    fetchList();
  }, [fetchList])

  const q = search.trim().toLowerCase();
  const visible = list.filter((f) => !q || f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q));

  return (
    <div className='list add flex-col'>
      <div className="list-header">
        <p>All Foods List ({list.length})</p>
        <input placeholder="Search by name or category" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="list-table">
        <div className="list-table-format title">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Action</b>
        </div>
        {loading && <p className="list-empty">Loading...</p>}
        {!loading && visible.length === 0 && <p className="list-empty">No foods found.</p>}
        {visible.map((item) => (
          <div key={item._id} className='list-table-format'>
            <img src={`${url}/images/` + item.image} alt={item.name} />
            <p>{item.name}</p>
            <p>{item.category}</p>
            <p>{CURRENCY}{item.price}</p>
            <p onClick={() => removeFood(item)} className='cursor remove' title="Remove">X</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default List
