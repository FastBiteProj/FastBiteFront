import "./OrderPage.css";
import { Navbar } from "../../components/Navbar/Navbar";
import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchCartFromRedis,
  removeProductFromCart,
  clearCart,
  clearCartParty
} from "../../redux/reducers/orderSlice";
import { PaymentForm } from "../../components/PaymentForm/PaymentForm";
import { fetchClientId } from "../../redux/reducers/paymentSlice";
import { OrderReceipt } from "../../components/OrderReceipt/OrderReceipt";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { fetchTables } from "../../redux/reducers/reservationSlice";
import * as signalR from "@microsoft/signalr";
import { 
  createParty, 
  getParty, 
  getPartyCart,
  selectPartyCart,
  selectPartyData,
  leaveParty,
  removeFromPartyCart
} from '../../redux/reducers/partySlice';
import { PartyCodeModal } from '../../components/PartyCodeModal/PartyCodeModal';
import { JoinPartyModal } from '../../components/JoinPartyModal/JoinPartyModal';
import { fetchProducts } from "../../redux/reducers/productSlice";

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
  const connectionRef = useRef(null);
  const [receiptData, setReceiptData] = useState(null);

  const order = useSelector((state) => {
    const currentPartyId = localStorage.getItem('currentPartyId');
    console.log('Current party ID:', currentPartyId); // Для отладки
    console.log('State products:', state.products.products); // Для отладки
    console.log('State order:', state.order.order); // Для отладки
    console.log('State party cart:', state.party.partyCart); // Для отладки

    if (currentPartyId) {
      return state.party.partyCart.map(productId => {
        const product = state.products.products.find(p => p.id === productId);
        return product || null;
      }).filter(Boolean);
    }
    return Array.isArray(state.order.order) ? state.order.order : [];
  });

  const partyData = useSelector(selectPartyData);
  const totalPrice = useSelector((state) => {
    const currentPartyId = localStorage.getItem('currentPartyId');
    if (currentPartyId) {
      return order.reduce((sum, product) => {
        const price = Number(product?.price) || 0;
        return sum + price;
      }, 0);
    }
    return Number(state.order.totalPrice) || 0;
  });

  const user = useSelector((state) => state.auth.user);
  const { clientId } = useSelector((state) => state.payment);
  const dispatch = useDispatch();

  // Инициализация данных
  useEffect(() => {
    dispatch(fetchClientId());
    dispatch(fetchProducts());
    const today = new Date().toISOString().split("T")[0];
    dispatch(fetchTables(today)).then((response) => {
      if (response.payload) {
        setTables(response.payload);
      }
    });
  }, [dispatch]);

  useEffect(() => {
    let mounted = true;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5156/orderHub", {
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 20000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connectionRef.current = connection;

    const startConnection = async () => {
      try {
        if (connection.state === signalR.HubConnectionState.Disconnected) {
          await connection.start();
          console.log("Connected to CartHub");
          
          const currentPartyId = localStorage.getItem('currentPartyId');
          if (currentPartyId && mounted) {
            await connection.invoke("JoinPartyGroup", currentPartyId);
            console.log(`Joined party group: ${currentPartyId}`);
            dispatch(getPartyCart(currentPartyId));
          } else if (user?.id && mounted) {
            dispatch(fetchCartFromRedis({ userId: user.id }));
          }
        }
      } catch (err) {
        console.error("Error connecting to CartHub:", err);
        setTimeout(startConnection, 5000);
      }
    };

    connection.onclose(async () => {
      if (mounted) {
        console.log("Connection closed, attempting to reconnect...");
        await startConnection();
      }
    });

    connection.on("CartUpdated", (updatedUserId) => {
      if (mounted && user?.id === updatedUserId) {
        console.log("Received personal cart update");
        dispatch(fetchCartFromRedis({ userId: user.id }));
      }
    });

    connection.on("PartyCartUpdated", (updatedPartyId) => {
      if (mounted) {
        const currentPartyId = localStorage.getItem('currentPartyId');
        if (currentPartyId === updatedPartyId) {
          console.log("Received party cart update");
          dispatch(getPartyCart(currentPartyId));
        }
      }
    });

    startConnection();

    return () => {
      mounted = false;
      const cleanup = async () => {
        try {
          const currentPartyId = localStorage.getItem('currentPartyId');
          if (connection.state === signalR.HubConnectionState.Connected) {
            if (currentPartyId) {
              try {
                await connection.invoke("LeavePartyGroup", currentPartyId);
                console.log("Successfully left party group");
              } catch (err) {
                console.log("Error leaving party group (expected during cleanup)");
              }
            }
            await connection.stop();
            console.log("Connection stopped");
          }
        } catch (err) {
          console.log("Error during cleanup (expected):", err);
        }
      };
      cleanup();
    };
  }, [dispatch, user?.id]);

  useEffect(() => {
    const checkPartyStatus = async () => {
      if (user?.id) {
        try {
          const savedPartyId = localStorage.getItem('currentPartyId');
          if (!savedPartyId) {
            setIsInParty(false);
            setCurrentPartyId(null);
            return;
          }

          const result = await dispatch(getParty(user.id)).unwrap();
          if (result) {
            setIsInParty(true);
            setCurrentPartyId(result.partyId);
            dispatch(getPartyCart(result.partyId));
          } else {
            localStorage.removeItem('currentPartyId');
            setIsInParty(false);
            setCurrentPartyId(null);
          }
        } catch (error) {
          console.error('Error checking party status:', error);
          localStorage.removeItem('currentPartyId');
          setIsInParty(false);
          setCurrentPartyId(null);
        }
      }
    };
    
    checkPartyStatus();
  }, [dispatch, user?.id]);

  const getTranslation = (product) => {
    if (!product.translations || product.translations.length === 0) {
      return { name: "N/A", description: "" };
    }
    const translation = product.translations.find(
      (t) => t.languageCode === i18n.language
    );
    return translation || product.translations[0];
  };

  const notifyPartyUpdate = async (partyId) => {
    try {
      if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
        await connectionRef.current.invoke("NotifyPartyCartUpdated", partyId);
      }
    } catch (error) {
      console.error("Error notifying party update:", error);
    }
  };

  const handleRemoveProduct = async (productId) => {
    try {
      const currentPartyId = localStorage.getItem('currentPartyId');
      if (currentPartyId) {
        await dispatch(removeFromPartyCart({ 
          partyId: currentPartyId, 
          productId 
        })).unwrap();
        await dispatch(getPartyCart(currentPartyId));
        await notifyPartyUpdate(currentPartyId);
      } else {
        await dispatch(removeProductFromCart({ 
          userId: user.id, 
          productId 
        })).unwrap();
        await dispatch(fetchCartFromRedis({ userId: user.id }));
      }
    } catch (error) {
      console.error('Error removing product:', error);
    }
  };

  const handleClearOrder = async () => {
    try {
      console.log('Clearing order with userId:', user.id, 'partyId:', currentPartyId);

      if (currentPartyId) {
        const partyRequest = {
          request: {
            partyId: currentPartyId
          }
        };
        await dispatch(clearCartParty(partyRequest)).unwrap();
        dispatch(getPartyCart(currentPartyId));
      } else {
        const clearCartRequest = {
          request: {
            userId: user.id
          }
        };
        await dispatch(clearCart(clearCartRequest)).unwrap();
        dispatch(fetchCartFromRedis({ userId: user.id }));
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      alert(t('cart.error.clear'));
    }
  };

  const handleConfirmOrder = () => {
    if (order.length > 0) {
      const currentPartyId = localStorage.getItem('currentPartyId');
      if (!currentPartyId && !selectedTable) {
        alert(t("order.pleaseSelectTable"));
        return;
      }
      setPaymentFormVisible(true);
    } else {
      console.log("Заказ пуст");
    }
  };

  const clearCartAfterPayment = async () => {
    try {
      const currentPartyId = localStorage.getItem('currentPartyId');
      console.log('Clearing cart after payment. PartyId:', currentPartyId); // Для отладки

      if (currentPartyId) {
        // Для групповой корзины
        await dispatch(clearCartParty({
          request: {
            partyId: currentPartyId
          }
        })).unwrap();
        
        // Обновляем состояние корзины группы
        await dispatch(getPartyCart(currentPartyId));
        
        // Уведомляем других участников группы
        if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
          await connectionRef.current.invoke("NotifyPartyCartUpdated", currentPartyId);
        }
      } else {
        // Для индивидуальной корзины
        await dispatch(clearCart({
          request: {
            userId: user.id
          }
        })).unwrap();
        
        // Обновляем состояние индивидуальной корзины
        await dispatch(fetchCartFromRedis({ userId: user.id }));
      }

      console.log('Cart cleared successfully'); // Для отладки
    } catch (error) {
      console.error("Error clearing cart after payment:", error);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      // Сохраняем данные заказа перед очисткой корзины
      const savedOrder = order.map(dish => ({
        name: getTranslation(dish).name,
        price: Number(dish.price),
        quantity: dish.quantity || 1,
        id: dish.id
      }));
      
      const savedTotal = totalPrice;
      
      // Сохраняем данные для чека
      setReceiptData({
        order: savedOrder,
        totalPrice: savedTotal
      });

      // Очищаем корзину
      await clearCartAfterPayment();
      
      // Обновляем UI
      setPaymentFormVisible(false);
      setShowReceipt(true);

      console.log('Payment processed successfully'); // Для отладки
    } catch (error) {
      console.error("Payment success handling error:", error);
    }
  };

  const handleCancelPayment = () => {
    setPaymentFormVisible(false);
  };

  const handleNewOrder = async () => {
    try {
      setShowReceipt(false);
      if (user?.id) {
        await dispatch(clearCart(user.id)).unwrap();
      }
      navigate("/menu");
    } catch (error) {
      console.error('Error handling new order:', error);
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

      if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
        await connectionRef.current.invoke("JoinPartyGroup", result);
      }
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
      const partyResult = await dispatch(getParty(user.id)).unwrap();
      const isLastMember = partyResult?.members?.length <= 1;

      if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
        try {
          await connectionRef.current.invoke("LeavePartyGroup", currentPartyId);
        } catch (err) {
          console.log("Error leaving party group (non-critical):", err);
        }
      }

      await dispatch(leaveParty({
        partyId: currentPartyId,
        userId: user.id,
        isLastMember
      })).unwrap();
      
      localStorage.removeItem('currentPartyId');
      setCurrentPartyId(null);
      setIsInParty(false);
      setShowPartyModal(false);
      
      if (user?.id) {
        dispatch(fetchCartFromRedis({ userId: user.id }));
      }
      
      setSelectedTable("");
    } catch (error) {
      console.error('Error leaving party:', error);
      localStorage.removeItem('currentPartyId');
      setCurrentPartyId(null);
      setIsInParty(false);
      setShowPartyModal(false);
    }
  };

  const handleJoinPartySuccess = async (partyId) => {
    try {
      console.log('Joining party with ID:', partyId);
      
      localStorage.setItem('currentPartyId', partyId);
      setCurrentPartyId(partyId);
      setIsInParty(true);
      
      if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
        await connectionRef.current.invoke("JoinPartyGroup", partyId);
      }
      
      dispatch(getPartyCart(partyId));
      setShowJoinModal(false);
      setShowPartyModal(true);
    } catch (error) {
      console.error('Error after joining party:', error);
      localStorage.removeItem('currentPartyId');
      setIsInParty(false);
      setCurrentPartyId(null);
    }
  };

  useEffect(() => {
    console.log('Current order:', order);
    console.log('Total price:', totalPrice);
  }, [order, totalPrice]);

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
          <div className="OrderPage__receipt-container">
            <OrderReceipt
              order={receiptData?.order || []}
              totalPrice={receiptData?.totalPrice || 0}
            />
            <button
              className="OrderPage__new-order-button"
              onClick={() => {
                setShowReceipt(false);
                setReceiptData(null);
                handleNewOrder();
              }}
            >
              {t("order.newOrder")}
            </button>
          </div>
        ) : !isPaymentFormVisible ? (
          <>
            <div className="OrderPage__order-list">
              {order.length > 0 ? (
                order.map((dish, index) => (
                  <div
                    key={`order-item-${Date.now()}-${index}-${dish.id}`}
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
                        onClick={() => handleRemoveProduct(dish.id)}
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
                {!isInParty ? (
                  <>
                    <label htmlFor="tableSelect">{t("order.selectTable")}: </label>
                    <select
                      id="tableSelect"
                      value={selectedTable}
                      onChange={(e) => setSelectedTable(e.target.value)}
                      required
                    >
                      <option key="default" value="">{t("order.chooseTable")}</option>
                      {tables.map((table) => (
                        <option key={`table-${table.tableNumber}`} value={table.tableNumber}>
                          {t("order.tableNumber")} {table.tableNumber}
                        </option>
                      ))}
                    </select>
                  </>
                ) : (
                  <div className="OrderPage__party-table">
                    {t("order.tableNumber")} {partyData?.tableId}
                  </div>
                )}
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
              userId: user.id,
              totalPrice: totalPrice,
              tableNumber: isInParty ? partyData?.tableId : parseInt(selectedTable),
              products: order.map(dish => ({
                productId: dish.id,
                productName: getTranslation(dish).name,
                quantity: dish.quantity || 1,
              }))
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