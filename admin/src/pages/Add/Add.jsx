import React, { useEffect, useMemo, useState } from 'react'
import './Add.css'
import { assets } from '../../assets/admin_assets/assets'
import api, { getErrorMessage } from '../../api'
import { toast } from 'react-toastify';

const CATEGORIES = ["Salad", "Rolls", "Deserts", "Sandwich", "Cake", "Pure Veg", "Pasta", "Noodles"]
const EMPTY = { name: "", description: "", price: "", category: "Salad" }

const Add = () => {

  const [image, setImage] = useState(null);
  const [data, setData] = useState(EMPTY)
  const [loading, setLoading] = useState(false)

  // Preview URL for the selected image (revoked when it changes)
  const preview = useMemo(() => (image ? URL.createObjectURL(image) : ""), [image])
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview])

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData(data => ({ ...data, [name]: value }))
  }

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (!image) return toast.error("Please upload an image");

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", Number(data.price));
    formData.append("category", data.category);
    formData.append("image", image);

    setLoading(true)
    try {
      const response = await api.post("/api/food/add", formData);
      setData(EMPTY);
      setImage(null)
      toast.success(response.data.message);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not add food"));
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="add">
      <form className='flex-col' onSubmit={onSubmitHandler}>
        <div className="add-img-upload flex-col">
          <p>Upload Image</p>
          <label htmlFor="image">
            <img src={preview || assets.upload_area} alt="Upload" />
          </label>
          <input onChange={(e) => setImage(e.target.files[0] || null)} type="file" id="image" accept="image/png,image/jpeg,image/webp" hidden />
        </div>
        <div className="add-product-name flex-col">
          <p>Product name</p>
          <input onChange={onChangeHandler} value={data.name} type="text" name='name' placeholder='Type here' required />
        </div>
        <div className="add-product-description flex-col">
          <p>Product description</p>
          <textarea onChange={onChangeHandler} value={data.description} name="description" rows="6" placeholder='Write content here' required></textarea>
        </div>
        <div className="add-category-price">
          <div className="add-category flex-col">
            <p>Product category</p>
            <select onChange={onChangeHandler} name="category" value={data.category}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="add-price flex-col">
            <p>Product Price</p>
            <input onChange={onChangeHandler} value={data.price} type="number" min="1" step="0.01" name='price' placeholder='$20' required />
          </div>
        </div>
        <button type='submit' className='add-btn' disabled={loading}>{loading ? "Adding..." : "Add"}</button>
      </form>
    </div>
  )
}

export default Add
