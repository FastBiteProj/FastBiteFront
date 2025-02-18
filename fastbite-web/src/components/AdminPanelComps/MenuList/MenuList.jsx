import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Modal from "../Modal/Modal";
import "./MenuList.css";
import { SearchDishForm } from "../Forms/SearchDishForm/SearchDishForm";
import { fetchProducts } from "../../../redux/reducers/productSlice";
  
export const MenuList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();
  
  const { products, status, error } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const getEnglishName = (product) => {
    if (!product.translations || product.translations.length === 0) {
      return "N/A";
    }
    const englishTranslation = product.translations.find(
      (t) => t.languageCode === 'en'
    );
    return englishTranslation ? englishTranslation.name : product.translations[0].name;
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'failed') {
    return <div>Error: {error}</div>;
  }

  const productsList = products || [];

  return (
    <div className="menu-list">
      <h2 className="menu-title" onClick={openModal}>
        Menu List
      </h2>
      <ul className="menu-items">
        {productsList.map((product) => (
          <li key={`${getEnglishName(product)}-${product.price}`} className="menu-item">
            <span className="item-name">{getEnglishName(product)}</span>
            <span className="item-price">${product.price}</span>
          </li>
        ))}
      </ul>
      <button className="menu-search-button" onClick={openModal}>
        Search In Menu
      </button>

      <Modal
        isOpen={isModalOpen}
        closeModal={closeModal}
        content={<SearchDishForm menuItems={productsList} />}
      />
    </div>
  );
};
