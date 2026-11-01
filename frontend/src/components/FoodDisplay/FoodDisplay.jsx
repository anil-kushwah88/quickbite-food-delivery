import React, { useContext } from 'react'
import { StoreContext } from '../../context/StoreContext'
import './FoodDisplay.css'
import FoodItem from '../FoodItem/FoodItem'

const FoodDisplay = ({ category }) => {

  const { food_list, foodLoading, foodError, fetchFoodList, searchQuery } = useContext(StoreContext)

  const query = searchQuery.trim().toLowerCase()
  const items = food_list.filter((item) =>
    (category === "All" || category === item.category) &&
    (!query || item.name.toLowerCase().includes(query) || item.category.toLowerCase().includes(query))
  )

  return (
    <div className='food-display' id='food-display'>
      <h2>{query ? `Results for "${searchQuery}"` : "Top dishes near you"}</h2>

      {foodError && (
        <p className="food-display-status">
          {foodError}
          <button onClick={fetchFoodList}>Retry</button>
        </p>
      )}

      {!foodLoading && !foodError && items.length === 0 && (
        <p className="food-display-status">No dishes found. Try another category or search.</p>
      )}

      <div className="food-display-list">
        {foodLoading
          ? Array.from({ length: 8 }).map((_, i) => <div key={i} className="food-skeleton" />)
          : items.map((item) => (
            <FoodItem
              key={item._id}
              id={item._id}
              name={item.name}
              description={item.description}
              price={item.price}
              image={item.image}
            />
          ))}
      </div>
    </div>
  )
}

export default FoodDisplay
