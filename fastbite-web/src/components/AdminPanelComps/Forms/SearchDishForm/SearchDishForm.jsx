import React, { useState } from "react";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import { FaTrash, FaEdit, FaCheck, FaTimes } from "react-icons/fa";
import { deleteProduct, updateProduct, fetchProducts } from "../../../../redux/reducers/productSlice";
import "./SearchDishForm.css";

const getEnglishName = (product) => {
  if (!product.translations || product.translations.length === 0) {
    return "N/A";
  }
  const englishTranslation = product.translations.find(
    (t) => t.languageCode === 'en'
  );
  return englishTranslation ? englishTranslation.name : product.translations[0].name;
};

export const SearchDishForm = ({ menuItems }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingDish, setEditingDish] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [editedPrice, setEditedPrice] = useState("");
  const dispatch = useDispatch();

  const filteredItems = menuItems.filter((item) =>
    getEnglishName(item).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (dish) => {
    setEditingDish(dish);
    setEditedName(getEnglishName(dish));
    setEditedPrice(dish.price);
  };

  const saveEdit = async (dish) => {
    try {
      const updateDto = {
        name: editedName,
        price: Number(editedPrice),
        imageUrl: dish.imageUrl,
        categoryName: dish.categoryName,
        translations: [
          {
            languageCode: 'en',
            name: editedName,
            description: dish.translations.find(t => t.languageCode === 'en')?.description || ''
          },
          ...dish.translations
            .filter(t => t.languageCode !== 'en')
            .map(t => ({
              languageCode: t.languageCode,
              name: t.name,
              description: t.description || ''
            }))
        ]
      };

      await dispatch(updateProduct({ 
        productName: getEnglishName(dish),
        productDto: updateDto
      })).unwrap();
      
      await dispatch(fetchProducts());
      
      window.alert(`Dish "${editedName}" was successfully updated!`);
    } catch (error) {
      console.error('Update error:', error);
      window.alert(typeof error === 'string' ? error : 'Failed to update dish');
    } finally {
      setEditingDish(null);
      setEditedName("");
      setEditedPrice("");
    }
  };

  const handleDelete = async (dish) => {
    const productName = getEnglishName(dish);
    console.log('Attempting to delete:', productName);

    if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      try {
        await dispatch(deleteProduct({ productName })).unwrap();
        await dispatch(fetchProducts());
        window.alert(`Dish "${productName}" was successfully deleted!`);
      } catch (error) {
        console.error('Delete error:', error);
        window.alert(error || 'Failed to delete dish');
      }
    }
  };

  return (
    <div className="search-dish-form">
      <h3>Manage Menu</h3>
      <input
        type="text"
        placeholder="Search for a dish..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="menu-search-input"
      />
      <div className="filtered-items">
        {filteredItems.map((dish, index) => (
          <div key={index} className="filtered-item">
            {editingDish === dish ? (
              <div className="edit-container">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="edit-input"
                  placeholder="Dish Name"
                />
                <input
                  type="number"
                  value={editedPrice}
                  onChange={(e) => setEditedPrice(e.target.value)}
                  className="edit-input"
                  placeholder="Price"
                />
                <FaCheck
                  className="user-actions-icon-edit save-icon"
                  title="Save"
                  onClick={() => saveEdit(dish)}
                />
                <FaTimes
                  className="user-actions-icon-edit cancel-icon"
                  title="Cancel"
                  onClick={() => {
                    setEditingDish(null);
                    setEditedName("");
                    setEditedPrice("");
                  }}
                />
              </div>
            ) : (
              <div className="menu-default">
                <span className="item-name">{getEnglishName(dish)}</span>
                <span className="item-price">${dish.price}</span>
                <div className="menu-actions">
                  <FaEdit
                    className="menu-actions-icon"
                    title="Edit"
                    onClick={() => handleEdit(dish)}
                  />
                  <FaTrash
                    className="menu-actions-icon"
                    title="Delete"
                    onClick={() => handleDelete(dish)}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

SearchDishForm.propTypes = {
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      imageUrl: PropTypes.string,
      categoryName: PropTypes.string,
      translations: PropTypes.arrayOf(
        PropTypes.shape({
          languageCode: PropTypes.string,
          name: PropTypes.string,
          description: PropTypes.string
        })
      )
    })
  ).isRequired,
};
