import "./OrderPage.css";
import { Navbar } from "../../components/Navbar/Navbar";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  clearOrder,
  removeFromOrder,
  checkOrderExpiration,
} from "../../redux/reducers/orderSlice";
import { PaymentForm } from "../../components/PaymentForm/PaymentForm";
import { fetchClientId } from "../../redux/reducers/paymentSlice";
import { OrderReceipt } from "../../components/OrderReceipt/OrderReceipt";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { fetchTables } from "../../redux/reducers/reservationSlice";
import { OrderTimer } from "../../components/OrderTimer/OrderTimer";
import { ORDER_TIMESTAMP_KEY } from "../../constants/orderConstants";
 
export const OrderPage = () => {
  const { t, i18n } = useTranslation();
  const [isPaymentFormVisible, setPaymentFormVisible] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const navigate = useNavigate();
  const [selectedTable, setSelectedTable] = useState("");
  const [tables, setTables] = useState([]);

  const order = useSelector((state) => state.order.order || []);
  const totalPrice = useSelector((state) => state.order.totalPrice || 0);
  const user = useSelector((state) => state.auth.user);
  const { clientId } = useSelector((state) => state.payment);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchClientId());
    const today = new Date().toISOString().split("T")[0];
    dispatch(fetchTables(today)).then((response) => {
      if (response.payload) {
        setTables(response.payload);
      }
    });
  }, [dispatch]);

  useEffect(() => {
    dispatch(checkOrderExpiration());

    const intervalId = setInterval(() => {
      dispatch(checkOrderExpiration());
    }, 60000);

    return () => clearInterval(intervalId);
  }, [dispatch]);

  const getTranslation = (product) => {
    if (!product.translations || product.translations.length === 0) {
      return { name: "N/A", description: "" };
    }
    const translation = product.translations.find(
      (t) => t.languageCode === i18n.language
    );
    return translation || product.translations[0];
  };

  const handleClearOrder = () => {
    dispatch(clearOrder());
    setPaymentFormVisible(false);
  };

  const handleConfirmOrder = () => {
    if (order.length > 0) {
      if (!selectedTable) {
        alert(t("order.pleaseSelectTable"));
        return;
      }
      setPaymentFormVisible(true);
    } else {
      console.log("Заказ пуст");
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentFormVisible(false);
    setShowReceipt(true);
  };

  const handleCancelPayment = () => {
    setPaymentFormVisible(false);
  };

  const handleNewOrder = () => {
    setShowReceipt(false);
    dispatch(clearOrder());
    navigate("/menu");
  };

  const orderTimestamp = Number(localStorage.getItem(ORDER_TIMESTAMP_KEY));

  const handleTimerExpire = () => {
    dispatch(clearOrder());
  };

  return (
    <div className="OrderPage">
      <div className="OrderPage__left-side">
        <div className="OrderPage__background" />
        <div></div>
        <div className="OrderPage__headers">
          <span className="OrderPage__left-top">{t("order.whatsIn")}</span>
          <span className="OrderPage__left-bot">{t("order.yourOrder")}</span>
        </div>

        <Navbar />
      </div>
      <div className="OrderPage__right-side">
        {showReceipt ? (
          <div>
            <OrderReceipt
              order={order}
              totalPrice={totalPrice}
              language={i18n.language}
            />
            <button
              className="OrderPage__new-order-button"
              onClick={handleNewOrder}
            >
              {t("order.newOrder")}
            </button>
          </div>
        ) : !isPaymentFormVisible ? (
          <>
            {order.length > 0 && orderTimestamp && (
              <OrderTimer
                timestamp={orderTimestamp}
                onExpire={handleTimerExpire}
              />
            )}
            <div className="OrderPage__order-list">
              {order.length > 0 ? (
                order.map((dish, index) => (
                  <div
                    key={`order-item-${dish.id || dish._id || index}`}
                    className="OrderPage__order-item"
                  >
                    <div className="OrderPage__order-item-details">
                      <span className="card-name">
                        {getTranslation(dish).name}
                      </span>
                      <span className="card-desc">
                        {getTranslation(dish).description}
                      </span>
                    </div>
                    <div className="OrderPage__order-item-price">
                      ${dish.price.toFixed(2)}
                      <button
                        className="OrderPage__remove-button"
                        onClick={() => dispatch(removeFromOrder(dish.uniqueID))}
                      >
                        {t("order.remove")}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="OrderPage__empty-order">
                  {t("order.emptyOrder")}
                </p>
              )}
            </div>
            <div className="OrderPage__total">
              <h2>
                {t("order.total")}: ${totalPrice.toFixed(2)}
              </h2>

              <div className="OrderPage__table-select">
                <label htmlFor="tableSelect">{t("order.selectTable")}: </label>
                <select
                  id="tableSelect"
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  required
                >
                  <option value="">{t("order.chooseTable")}</option>
                  {tables.map((table) => (
                    <option key={table.id} value={table.tableNumber}>
                      {t("order.tableNumber")} {table.tableNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div className="OrderPage__buttons">
              <button
                className="OrderPage__confirm-button"
                onClick={handleConfirmOrder}
              >
                {t("order.confirmOrder")}
              </button>
              <button
                className="OrderPage__clear-button"
                onClick={handleClearOrder}
              >
                {t("order.clearOrder")}
              </button>
            </div>
            </div>

          </>
        ) : (
          <PaymentForm
            totalPrice={totalPrice}
            onSuccess={handlePaymentSuccess}
            onCancel={handleCancelPayment}
            clientId={clientId}
            source="order"
            orderData={{
              id: crypto.randomUUID(),
              userId: user.id,
              totalPrice: totalPrice,
              tableNumber: parseInt(selectedTable),
              confirmationDate: new Date().toISOString(),
              productNames: Array.isArray(order)
                ? order.map((dish) => ({
                    productName: getTranslation(dish).name,
                    quantity: 1,
                  }))
                : [],
            }}
          />
        )}
      </div>
    </div>
  );
};
