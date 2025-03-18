import { useTranslation } from "react-i18next";
import { Navbar } from "../../components/Navbar/Navbar";
import "./ReservePage.css";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { TableCanvas } from "../../components/TableCanvas/TableCanvas";
import {
  fetchTables,
  createReservation,
  addOrderItem,
  removeOrderItem,
  updateOrderItemQuantity,
  resetReservation,
} from "../../redux/reducers/reservationSlice";
import { fetchProducts } from "../../redux/reducers/productSlice";
import { PaymentForm } from "../../components/PaymentForm/PaymentForm";
import { fetchClientId } from "../../redux/reducers/paymentSlice";
 
export const ReservePage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { tables, status, error, orders } = useSelector(
    (state) => state.reservation
  );
  const [reservationData, setReservationData] = useState(null);

  const [isModalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");

  const [date, setDate] = useState("");
  const [time, setTime] = useState({ start: "", end: "" });
  const [guests, setGuests] = useState("");
  const [table, setTable] = useState("");

  const [isBlurred, setBlurred] = useState(true);

  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const availableTimes = [
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
    "23:00",
  ];

  const [showOrderModal, setShowOrderModal] = useState(false);

  const { products } = useSelector((state) => state.products);

  const [isPaymentFormVisible, setPaymentFormVisible] = useState(false);
  const { clientId } = useSelector((state) => state.payment);

  useEffect(() => {
    dispatch(fetchClientId());
  }, [dispatch]);


  const handleProceedToNextStep = () => {
    if (!date) {
      setModalContent(t("reserve.modal.selectDate"));
      setModalOpen(true);
      return;
    }

    setBlurred(false);
  };

  const handleConfirmReservation = async () => {
    if (!isAuthenticated || !user.id) {
      setModalContent(t("reserve.modal.loginRequired"));
      setModalOpen(true);
      return;
    }

    if (!time.start || !time.end) {
      setModalContent(t("reserve.modal.selectTime"));
      setModalOpen(true);
      return;
    }

    const startHour = parseInt(time.start.split(":")[0]);
    const endHour = parseInt(time.end.split(":")[0]);
    if (startHour >= endHour) {
      setModalContent(t("reserve.modal.invalidTimeRange"));
      setModalOpen(true);
      return;
    }

    if (!table) {
      setModalContent(t("reserve.modal.selectTable"));
      setModalOpen(true);
      return;
    }

    if (!guests) {
      setModalContent(t("reserve.modal.enterGuests"));
      setModalOpen(true);
      return;
    }

    const selectedTable = tables.find(t => t.tableNumber.toString() === table);
    if (selectedTable && parseInt(guests) > selectedTable.tableCapacity) {
      setModalContent(t("reserve.modal.tooManyGuests", { capacity: selectedTable.tableCapacity }));
      setModalOpen(true);
      return;
    }

    const hasOrder = Object.keys(orders.items).length > 0;

    if (hasOrder) {
      setPaymentFormVisible(true);
    } else {
      await createReservationHandler(null);
    }
  };

  const handlePaymentSuccess = async () => {
    const orderData = {
      userId: user.id,
      totalPrice: orders.total,
      tableNumber: parseInt(table),
      confirmationDate: new Date().toISOString(),
      productNames: Object.entries(orders.items).map(([id, item]) => ({
        productName: item.name,
        quantity: item.quantity
      })),
    };

    await createReservationHandler(orderData);
    setPaymentFormVisible(false);
  };

  const handlePaymentCancel = () => {
    setPaymentFormVisible(false);
  };

  const createReservationHandler = async (orderData) => {
    try {
      const newReservation = {
        reservationStartTime: time.start,
        reservationEndTime: time.end,
        reservationDate: date,
        guestCount: parseInt(guests),
        tableNumber: parseInt(table),
        userId: user.id,
        order: orderData,
      };
  
      console.log("Отправка данных бронирования:", newReservation);
  
      const result = await dispatch(createReservation(newReservation)).unwrap();
  
      setModalContent(t("reserve.modal.reservationSuccess"));
      setModalOpen(true);
      setShowOrderModal(false);
  
      setTime({ start: "", end: "" });
      setTable("");
      setDate("");
      setGuests("");
      dispatch(resetReservation());
      setBlurred(true);
    } catch (error) {
      console.log("Ошибка при бронировании:", error);
      
      if (error.includes("Table is already reserved")) {
        setModalContent(t("reserve.modal.tableAlreadyReserved"));
        setTable("");
      } else if (error.includes("Invalid time range")) {
        setModalContent(t("reserve.modal.invalidTimeRange"));
        setTime({ start: "", end: "" });
      } else {
        setModalContent(t("reserve.modal.generalError"));
      }
      
      setModalOpen(true);
    }
  };

  const closeModal = () => {
    const modal = document.querySelector(".modal-reserve");
    if (modal) {
      modal.classList.add("closing");
      setTimeout(() => {
        setModalOpen(false);
        modal.classList.remove("closing");
      }, 500);
    }
  };

  useEffect(() => {
    if (date) {
      dispatch(fetchTables(date));
    }
  }, [date, dispatch]);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const renderOrderModal = () => {
    const handleProductAction = (product, action) => {
      const productName =
        product.translations.find((t) => t.languageCode === "en")?.name ||
        product.name;

      switch (action) {
        case "ADD":
          dispatch(
            addOrderItem({
              id: productName,
              name: productName,
              price: product.price,
              quantity: 1,
            })
          );
          break;

        case "INCREASE":
          const currentQty = orders.items[productName]?.quantity || 0;
          dispatch(
            updateOrderItemQuantity({
              id: productName,
              quantity: currentQty + 1,
            })
          );
          break;

        case "DECREASE":
          const qty = orders.items[productName]?.quantity || 0;
          if (qty === 1) {
            dispatch(removeOrderItem({ id: productName }));
          } else {
            dispatch(
              updateOrderItemQuantity({
                id: productName,
                quantity: qty - 1,
              })
            );
          }
          break;
      }
    };

    return (
      <div className="modal-reserve order-modal">
        <div className="modal-reserve-content">
          <h2>{t("reserve.modal.addItems")}</h2>
          <div className="products-list">
            {products.map((product) => {
              const productName =
                product.translations.find((t) => t.languageCode === "en")
                  ?.name || product.name;

              return (
                <div key={productName} className="product-item">
                  <div className="product-info">
                    <span className="product-name">{productName}</span>
                    <span className="product-price">${product.price}</span>
                  </div>
                  {!orders.items[productName] ? (
                    <button
                      className="add-button"
                      onClick={() => handleProductAction(product, "ADD")}
                    >
                      + Add
                    </button>
                  ) : (
                    <div className="quantity-controls">
                      <button
                        className="quantity-btn"
                        onClick={() => handleProductAction(product, "DECREASE")}
                      >
                        -
                      </button>
                      <span className="quantity-display">
                        {orders.items[productName]?.quantity || 0}
                      </span>
                      <button
                        className="quantity-btn"
                        onClick={() => handleProductAction(product, "INCREASE")}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {Object.keys(orders.items).length > 0 && (
            <div className="selected-items-summary">
              <h3>{t("reserve.modal.selectedItems")}</h3>
              <div className="selected-items-list">
                {Object.entries(orders.items).map(([name, item]) => (
                  <div key={name} className="selected-item">
                    <span>{item.name}</span>
                    <span>x{item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="total">
                <strong>
                  {t("reserve.modal.total")} ${orders.total.toFixed(2)}
                </strong>
              </div>
            </div>
          )}

          <div className="modal-buttons">
            <button
              className="cancel-btn"
              onClick={() => {
                setShowOrderModal(false);
                dispatch(resetReservation());
              }}
            >
              {t("reserve.modal.cancel")}
            </button>
            <button
              className="confirm-btn"
              onClick={() => setShowOrderModal(false)}
              disabled={Object.keys(orders.items).length === 0}
            >
              {t("reserve.modal.confirmOrderReservation")}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleTimeChange = (type, value) => {
    setTime(prev => ({ ...prev, [type]: value }));
    
    if (modalContent.includes("time")) {
      setModalOpen(false);
    }
  };

  const handleGuestsChange = (value) => {
    setGuests(value);
    
    if (modalContent.includes("guests")) {
      setModalOpen(false);
    }
  };

  return (
    <div className="ReservePage">
      <div className="ReservePage__left-side">
        <div className="ReservePage__background" />
        <div></div>
        <div className="ReservePage__headers">
          <span className="ReservePage__left-top">
            {t("reserve.bookTable")}
          </span>
          <span className="ReservePage__left-bot">
            {t("reserve.reservation")}
          </span>
        </div>

        <Navbar />
      </div>
      <div className="ReservePage__right-side">
        {isPaymentFormVisible ? (
          <PaymentForm
            totalPrice={orders.total}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
            clientId={clientId}
            source="reservation"
            reservationData={reservationData}
            orderData={{
              userId: user.id,
              totalPrice: orders.total,
              tableNumber: parseInt(table),
              confirmationDate: new Date().toISOString(),
              productNames: Object.entries(orders.items).map(([id, item]) => ({
                productName: item.name,
                quantity: item.quantity
              })),
            }}
          />
        ) : (
          <div>
            <div className="ReservePage__right-form-block">
              <div className="ReservePage__date-group">
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <button
                className="ReservePage__submit-button"
                onClick={handleProceedToNextStep}
              >
                {t("reserve.chooseTable")}
              </button>
            </div>

            <div
              className={`ReservePage__right-plan-container ${
                isBlurred ? "blurred" : ""
              }`}
            >
              {error ? (
                <div className="error-message">{error}</div>
              ) : (
                <TableCanvas
                  selectedTable={table}
                  onTableSelect={setTable}
                  isBlurred={isBlurred}
                  tables={tables}
                  status={status}
                />
              )}
            </div>

            <div
              className={`ReservePage__right-inputs ${
                isBlurred ? "blurred" : ""
              }`}
            >
              <div className="ReservePage__time-block">
                <div className="ReservePage__time-group">
                  <label htmlFor="startTime">{t("reserve.startTime")}</label>
                  <select
                    id="startTime"
                    name="startTime"
                    value={time.start}
                    onChange={(e) => handleTimeChange("start", e.target.value)}
                  >
                    <option value="">{t("reserve.selectStartTime")}</option>
                    {availableTimes.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="ReservePage__time-group">
                  <label htmlFor="endTime">{t("reserve.endTime")}</label>
                  <select
                    id="endTime"
                    name="endTime"
                    value={time.end}
                    onChange={(e) => handleTimeChange("end", e.target.value)}
                  >
                    <option value="">{t("reserve.selectEndTime")}</option>
                    {availableTimes.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="ReservePage__time-group">
                  <label htmlFor="guests">{t("reserve.guests")}</label>
                  <input
                    type="number"
                    id="guests"
                    name="guests"
                    min="1"
                    max="10"
                    value={guests}
                    onChange={(e) => handleGuestsChange(e.target.value)}
                    placeholder="1-10"
                  />
                </div>
              </div>

              <div className="ReservePage__buttons-container">
                <button
                  className="ReservePage__submit-button"
                  onClick={() => setShowOrderModal(true)}
                >
                  {t("reserve.addOrder")}
                </button>

                <button
                  className="ReservePage__submit-button"
                  onClick={handleConfirmReservation}
                >
                  {t("reserve.confirmReservation")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {isModalOpen && (
        <div className="modal-reserve">
          <div className="modal-reserve-content">
            <p>{modalContent}</p>
            <button onClick={closeModal}>{t("reserve.modal.close")}</button>
          </div>
        </div>
      )}

      {showOrderModal && renderOrderModal()}
    </div>
  );
};
