import { useTranslation } from 'react-i18next';
import { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useDispatch } from "react-redux";
import { createOrder } from "../../redux/reducers/orderSlice";
import "./PaymentForm.css";
import { PaymentType } from '../../constants/paymentConstants';

export const PaymentForm = ({ totalPrice, onSuccess, onCancel, clientId, orderData }) => {
  const { t } = useTranslation();
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  const dispatch = useDispatch();

  console.log('Initial orderData in PaymentForm:', orderData);

  const handleCardNumberChange = (event) => {
    const value = event.target.value.replace(/\D/g, "");
    const formattedValue = value.replace(/(\d{4})(?=\d)/g, "$1 ");
    if (formattedValue.length <= 19) {
      setCardNumber(formattedValue);
    }
  };

  const handleExpiryDateChange = (event) => {
    const value = event.target.value.replace(/\D/g, "");
    const formattedValue = value.replace(/(\d{2})(?=\d)/g, "$1/");
    if (formattedValue.length <= 5) {
      setExpiryDate(formattedValue);
    }
  };

  const handleCvvChange = (event) => {
    const value = event.target.value.replace(/\D/g, "");
    if (value.length <= 3) {
      setCvv(value);
    }
  };

  const handleCardPayment = async (e) => {
    e.preventDefault();
    try {
      // Проверяем, откуда пришел заказ (из резервации или обычного заказа)
      const transformedOrderData = orderData.productNames ? 
        // Для резервации
        {
          userId: orderData.userId,
          tableNumber: orderData.tableNumber,
          productNames: orderData.productNames // Уже в правильном формате
        } :
        // Для обычного заказа
        {
          userId: orderData.userId,
          tableNumber: orderData.tableNumber,
          productNames: orderData.products.map(product => ({
            productName: product.productName,
            quantity: product.quantity
          }))
        };

      console.log("Creating card order with data:", transformedOrderData);
      const response = await dispatch(createOrder(transformedOrderData)).unwrap();
      console.log("Card order response:", response);
      onSuccess();
    } catch (error) {
      console.error("Error creating card order:", error);
      alert(t('payment.error.card'));
    }
  };

  const handleCashPayment = async () => {
    try {
      const transformedOrderData = orderData.productNames ? 
        // Для резервации
        {
          userId: orderData.userId,
          tableNumber: orderData.tableNumber,
          productNames: orderData.productNames,
          paymentType: Number(PaymentType.CASH),
          isPaid: false
        } :
        // Для обычного заказа
        {
          userId: orderData.userId,
          tableNumber: orderData.tableNumber,
          productNames: orderData.products.map(product => ({
            productName: product.productName,
            quantity: product.quantity
          })),
          paymentType: Number(PaymentType.CASH),
          isPaid: false
        };

      console.log("Creating cash order with data:", transformedOrderData);
      const response = await dispatch(createOrder(transformedOrderData)).unwrap();
      console.log("Cash order response:", response);
      onSuccess();
    } catch (error) {
      console.error("Error creating cash order:", error);
      alert(t('payment.error.cash'));
    }
  };

  if (!clientId) {
    return <div>{t('payment.loading')}</div>;
  }

  return (
    <PayPalScriptProvider options={{ "client-id": clientId }}>
      <div className="PaymentForm">
        <h2 className="PaymentForm__title">{t('payment.title')}</h2>

        <div className="PaymentForm__total">
          <span>{t('payment.total.label')}</span>
          <span className="PaymentForm__total-price">
            ${totalPrice}
          </span>
        </div>

        <form className="PaymentForm__form" onSubmit={handleCardPayment}>
          <label className="PaymentForm__label">
            {t('payment.form.cardholderName.label')}
          </label>
          <input 
            type="text" 
            className="PaymentForm__input" 
            placeholder={t('payment.form.cardholderName.placeholder')} 
            required 
          />

          <label className="PaymentForm__label">
            {t('payment.form.cardNumber.label')}
          </label>
          <input
            type="text"
            className="PaymentForm__input"
            placeholder={t('payment.form.cardNumber.placeholder')}
            value={cardNumber}
            onChange={handleCardNumberChange}
            required
          />

          <div className="PaymentForm__row">
            <div className="PaymentForm__column">
              <label className="PaymentForm__label">
                {t('payment.form.expiryDate.label')}
              </label>
              <input
                type="text"
                className="PaymentForm__input"
                placeholder={t('payment.form.expiryDate.placeholder')}
                value={expiryDate}
                onChange={handleExpiryDateChange}
                required
              />
            </div>
            <div className="PaymentForm__column">
              <label className="PaymentForm__label">
                {t('payment.form.cvv.label')}
              </label>
              <input
                type="text"
                className="PaymentForm__input"
                placeholder={t('payment.form.cvv.placeholder')}
                value={cvv}
                onChange={handleCvvChange}
                required
              />
            </div>
          </div>

          <div className="PaymentForm__buttons">
            <button type="submit" className="PaymentForm__submit-button">
              {t('payment.buttons.pay')}
            </button>
            <button 
              type="button" 
              className="PaymentForm__cash-button"
              onClick={handleCashPayment}
            >
              {t('payment.methods.cash')}
            </button>
            <button 
              type="button" 
              className="PaymentForm__cancel-button" 
              onClick={onCancel}
            >
              {t('payment.buttons.cancel')}
            </button>
          </div>
        </form>

        <div className="PaymentForm__paypal">
          <PayPalButtons
            createOrder={(data, actions) => {
              return actions.order.create({
                purchase_units: [
                  {
                    amount: {
                      value: totalPrice,
                    },
                  },
                ],
              });
            }}
            onApprove={(data, actions) => {
              return actions.order.capture().then((details) => {
                const transformedOrderData = orderData.productNames ? 
                  // Для резервации
                  {
                    userId: orderData.userId,
                    tableNumber: orderData.tableNumber,
                    productNames: orderData.productNames,
                    paymentType: PaymentType.ONLINE,
                    isPaid: true
                  } :
                  // Для обычного заказа
                  {
                    userId: orderData.userId,
                    tableNumber: orderData.tableNumber,
                    productNames: orderData.products.map(product => ({
                      productName: product.productName,
                      quantity: product.quantity
                    })),
                    paymentType: PaymentType.ONLINE,
                    isPaid: true
                  };

                console.log('Creating PayPal order with data:', transformedOrderData);
                return dispatch(createOrder(transformedOrderData))
                  .unwrap()
                  .then((response) => {
                    console.log("PayPal order response:", response);
                    onSuccess(details);
                  })
                  .catch((error) => {
                    console.error("Error creating PayPal order:", error);
                    throw error;
                  });
              });
            }}
            onCancel={onCancel}
            onError={(err) => {
              console.error("PayPal error:", err);
              alert(t('payment.error.paypal'));
            }}
          />
        </div>
      </div>
    </PayPalScriptProvider>
  );
};