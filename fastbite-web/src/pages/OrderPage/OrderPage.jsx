import "./OrderPage.css";
import { Navbar } from "../../components/Navbar/Navbar";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchCartFromRedis,
  removeProductFromCart,
  clearCart,
} from "../../redux/reducers/orderSlice";
import { PaymentForm } from "../../components/PaymentForm/PaymentForm";
import { fetchClientId } from "../../redux/reducers/paymentSlice";
import { OrderReceipt } from "../../components/OrderReceipt/OrderReceipt";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { fetchTables } from "../../redux/reducers/reservationSlice";
import { OrderTimer } from "../../components/OrderTimer/OrderTimer";
import { ORDER_TIMESTAMP_KEY } from "../../constants/orderConstants";
import * as signalR from "@microsoft/signalr";
import { 
  createParty, 
  getParty, 
  getPartyCart,
  leaveParty
} from '../../redux/reducers/partySlice';
import { PartyCodeModal } from '../../components/PartyCodeModal/PartyCodeModal';
import { JoinPartyModal } from '../../components/JoinPartyModal/JoinPartyModal';

export const OrderPage = () => {
  const { t, i18n } = useTranslation();
  const [isPaymentFormVisible, setPaymentFormVisible] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const navigate = useNavigate();
  const [selectedTable, setSelectedTable] = useState("");
  const [tables, setTables] = useState([]);
  const [showPartyModal, setShowPartyModal] = useState(false);
  const [partyCode, setPartyCode] = useState(null);
  const [isInParty, setIsInParty] = useState(false);
  const [currentPartyId, setCurrentPartyId] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);

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
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5156/orderHub")
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(() => console.log("Connected to OrderHub"))
      .catch(err => console.error("Error While connecting to orderHub: ", err));

    connection.on("ReceiveOrderUpdate", () => {
      if (user && user.id) {
        console.log("Update of Cart");
        dispatch(fetchCartFromRedis({ userId: user.id }));
      } 
    });

    return () => {
      connection.stop();
    };
  }, []);

  useEffect(() => {
    if (user && user.id) {
      console.log('User', user.id);
      dispatch(fetchCartFromRedis({ userId: user.id }));
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    const checkPartyStatus = async () => {
      if (user && user.id) {
        try {
          const result = await dispatch(getParty(user.id)).unwrap();
          if (result) {
            setIsInParty(true);
            setCurrentPartyId(result.partyId);
          }

          console.log(result.partyCode, result.partyId)
        } catch (error) {
          console.error('Error checking party status:', error);
        }
      }
    };
    
    checkPartyStatus();
  }, [dispatch, user?.id]);

  useEffect(() => {
    const savedPartyId = localStorage.getItem('currentPartyId');
    if (savedPartyId) {
      setCurrentPartyId(savedPartyId);
      setIsInParty(true);
    }
  }, []);

  const getTranslation = (product) => {
    if (!product.translations || product.translations.length === 0) {
      return { name: "N/A", description: "" };
    }
    const translation = product.translations.find(
      (t) => t.languageCode === i18n.language
    );
    return translation || product.translations[0];
  };

  const handleClearOrder = async () => {
    try {
      if (user && user.id) {
        await dispatch(clearCart(user.id)).unwrap();
        setPaymentFormVisible(false);
        dispatch(fetchCartFromRedis({ userId: user.id }));
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
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

  const handleNewOrder = async () => {
    try {
      setShowReceipt(false);
      if (user && user.id) {
        await dispatch(clearCart(user.id)).unwrap();
      }
      navigate("/menu");
    } catch (error) {
      console.error('Error handling new order:', error);
    }
  };

  const orderTimestamp = Number(localStorage.getItem(ORDER_TIMESTAMP_KEY));

  const handleTimerExpire = () => {
    dispatch(clearOrder());
  };

  const handleRemoveProduct = async (userId, productId) => {
    try {
      await dispatch(removeProductFromCart({ userId, productId })).unwrap();
      dispatch(fetchCartFromRedis({ userId }));
    } catch (error) {
      console.error('Error removing product:', error);
    }
  };

  const handleCreateParty = async () => {
    try {
      if (!selectedTable) {
        alert(t("order.pleaseSelectTable"));
        return;
      }
      
      const result = await dispatch(createParty({
        ownerId: user.id,
        tableId: parseInt(selectedTable)
      })).unwrap();
      
      console.log('Created party ID:', result);

      localStorage.setItem('currentPartyId', result);
      setCurrentPartyId(result);
      setIsInParty(true);
      setShowPartyModal(true);
    } catch (error) {
      console.error('Error creating party:', error);
      alert(t("order.errorCreatingParty"));
    }
  };

  const handleCloseModal = () => {
    setShowPartyModal(false);
    setPartyCode(null);
  };


  const handleLeaveParty = async () => {
    try {
      await dispatch(leaveParty({
        partyId: currentPartyId,
        userId: user.id
      })).unwrap();
      
      localStorage.removeItem('currentPartyId');
      setCurrentPartyId(null);
      setIsInParty(false);
      setShowPartyModal(false);
    } catch (error) {
      console.error('Error leaving party:', error);
    }
  };

  const handleJoinPartySuccess = () => {
    setIsInParty(true);
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
                      ${dish.price}
                      <button
                        className="OrderPage__remove-button"
                        onClick={() => handleRemoveProduct(user.id, dish.id)}
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
                {t("order.total")}: ${totalPrice}
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
                {isInParty ? (
                  <button 
                    className="OrderPage__party-button"
                    onClick={() => {
                      console.log('Current Party ID:', currentPartyId);
                      setShowPartyModal(true);
                    }}
                  >
                    {t("order.showParty")}
                  </button>
                ) : (
                  <>
                    <button 
                      className="OrderPage__party-button"
                      onClick={handleCreateParty}
                    >
                      {t("order.createParty")}
                    </button>
                    <button
                      className="OrderPage__party-button"
                      onClick={() => setShowJoinModal(true)}
                    >
                      {t("order.joinParty")}
                    </button>
                  </>
                )}
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
      {showPartyModal && currentPartyId && (
        <PartyCodeModal 
          partyId={currentPartyId}
          userId={user.id}
          onClose={handleCloseModal}
          onLeave={handleLeaveParty}
        />
      )}
      {showJoinModal && (
        <JoinPartyModal
          userId={user.id}
          onClose={() => setShowJoinModal(false)}
          onJoinSuccess={handleJoinPartySuccess}
        />
      )}
    </div>
  );
};
