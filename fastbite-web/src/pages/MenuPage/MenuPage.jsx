import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { fetchProducts } from "../../redux/reducers/productSlice";
import { Navbar } from "../../components/Navbar/Navbar";
import { addProductToCart } from '../../redux/reducers/orderSlice.js';
import { addToPartyCart } from "../../redux/reducers/partySlice.js";
import { Notification } from "../../components/Notification/Notification";
import "./MenuPage.css";
import { Link } from "react-router-dom";
import  Loader from '../../components/Loader/Loader.jsx'
import * as signalR from "@microsoft/signalr";

export const MenuPage = () => {
  const { t, i18n } = useTranslation();
  const [activeCategory, setActiveCategory] = useState(null);
  const [notification, setNotification] = useState({
    message: "",
    visible: false,
  });
  const categoryRefs = useRef({});
  const dispatch = useDispatch();

  const products = useSelector((state) => state.products.products);
  const productsStatus = useSelector((state) => state.products.status);
  const user = useSelector((state) => state.auth.user)

  useEffect(() => {
    if (productsStatus === "idle") {
      dispatch(fetchProducts());
    }
  }, [dispatch, productsStatus]);

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5156/orderHub")
      .withAutomaticReconnect([0, 2000, 5000, 10000, 20000]) 
      .configureLogging(signalR.LogLevel.Information)
      .build();

    const startConnection = async () => {
      try {
        await connection.start();
        console.log("Connected to CartHub from MenuPage");
        
        const currentPartyId = localStorage.getItem('currentPartyId');
        if (currentPartyId) {
          await connection.invoke("JoinPartyGroup", currentPartyId);
          console.log(`Joined party group: ${currentPartyId}`);
        }
      } catch (err) {
        console.error("Error connecting to CartHub:", err);
      }
    };

    connection.onclose(async () => {
      console.log("Connection closed, attempting to reconnect...");
      await startConnection();
    });

    startConnection();

    return () => {
      if (connection.state === signalR.HubConnectionState.Connected) {
        const currentPartyId = localStorage.getItem('currentPartyId');
        if (currentPartyId) {
          connection.invoke("LeavePartyGroup", currentPartyId)
            .catch(err => console.error("Error leaving party group:", err));
        }
        connection.stop()
          .catch(err => console.error("Error stopping connection:", err));
      }
    };
  }, []);

  const handleAddToOrder = async (dish) => {
    console.log(user, user.id);
    console.log(dish, dish.id);
    
    const currentPartyId = localStorage.getItem('currentPartyId');
    
    try {
      if (currentPartyId) {
        await dispatch(addToPartyCart({ 
          partyId: currentPartyId,
          productId: dish.id 
        })).unwrap();
      } else {
        await dispatch(addProductToCart({ 
          userId: user.id, 
          productId: dish.id 
        })).unwrap();
      }
      
      showNotification(`${getTranslation(dish).name} ${t("menu.addedToOrder")}`);
    } catch (error) {
      console.error('Error adding product to cart:', error);
      showNotification(t("menu.errorAddingToOrder"));
    }
  };

  const showNotification = (message) => {
    setNotification({ message, visible: true });
    setTimeout(() => {
      setNotification({ message: "", visible: false });
    }, 3000);
  };

  const categories =
    products.length > 0
      ? [...new Set(products.map((product) => product.categoryName))]
      : [];

  const scrollToCategory = (category) => {
    if (categoryRefs.current[category]) {
      categoryRefs.current[category].scrollIntoView({ behavior: "smooth" });
      setActiveCategory(category);
    }
  };

  const handleScroll = () => {
    const offsets = categories.map((category) => {
      return {
        category,
        offset: categoryRefs.current[category]?.getBoundingClientRect().top,
      };
    });

    const visibleCategory = offsets.find(({ offset }) => offset >= 0);
    if (visibleCategory) {
      setActiveCategory(visibleCategory.category);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const getTranslation = (product) => {
    const translation = product.translations.find(
      (t) => t.languageCode === i18n.language
    );
    return translation || product.translations[0];
  };

  

  return (
    <div className="MenuPage">
      <div className="MenuPage__left-side">
        <div className="MenuPage__background" />
        <div>

        </div>
        <div className="MenuPage__headers">
          <span className="MenuPage__left-top">{t("menu.checkOut")}</span>
          <span className="MenuPage__left-bot">{t("menu.ourMenu")}</span>
        </div>

        <Navbar />
      </div>
      <div className="MenuPage__right-side">
      {productsStatus === "loading" ? (
          <div className="MenuPage__loader">
            <Loader />
          </div>
        ) : (
          <>
        <div className="MenuPage__right-categories">
          {categories.map((category) => (
            <button
              key={`category-button-${category}`}
              className={`MenuPage__right-item ${
                activeCategory === category ? "active" : ""
              }`}
              onClick={() => scrollToCategory(category)}
            >
              {t(`menu.categories.${category.toLowerCase()}`)}
            </button>
          ))}
        </div>
        <div className="MenuPage__right-menulist">
          {categories.map((category) => (
            <div
              key={`category-section-${category}`}
              className="MenuPage__category-section"
              ref={(el) => (categoryRefs.current[category] = el)}
            >
              <h2 className="MenuPage__category-title">
                {t(`menu.categories.${category.toLowerCase()}`)}
              </h2>
              {products
                .filter((dish) => dish.categoryName === category)
                .map((dish, index) => (
                  <div
                    key={`menu-card-${category}-${
                      dish.id || dish._id || index
                    }`}
                    className="MenuPage__card"
                  >
                    <img
                      src={dish.imageUrl}
                      alt={getTranslation(dish).name}
                      className="MenuPage__card-image"
                    />
                    <div className="MenuPage__card-desc">
                      <div className="MenuPage__card-desc-info">
                        <span className="card-name">
                          {getTranslation(dish).name}
                        </span>
                        <span className="card-desc">
                          {getTranslation(dish).description}
                        </span>
                      </div>
                      <div className="MenuPage__card-price-button">
                        <span className="MenuPage__card-price">
                          ${dish.price}
                        </span>
                        <button
                          onClick={() => handleAddToOrder(dish)}
                          className="add-to-order-button"
                        >
                          {t("menu.addToOrder")}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>
        </>
      )}
      </div>
      <Notification
        message={notification.message}
        visible={notification.visible}
      />
    </div>
  );
};
