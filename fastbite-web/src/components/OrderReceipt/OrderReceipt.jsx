import { useTranslation } from 'react-i18next';
import './OrderReceipt.css';

export const OrderReceipt = ({ order, totalPrice }) => {
  const { t } = useTranslation();

  console.log('Receipt data:', { order, totalPrice }); // Для отладки

  if (!order || order.length === 0) {
    console.warn('No order data provided to receipt');
    return null;
  }

  return (
    <div className="OrderReceipt">
      <h2>{t('receipt.title')}</h2>
      <div className="OrderReceipt__items">
        {order.map((item, index) => (
          <div key={`receipt-item-${index}`} className="OrderReceipt__item">
            <div className="OrderReceipt__item-info">
              <span className="OrderReceipt__item-name">
                {item.name}
                <span className="OrderReceipt__item-quantity"> × {item.quantity}</span>
              </span>
            </div>
            <span className="OrderReceipt__item-price">
              ${Number(item.price).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      <div className="OrderReceipt__divider"></div>
      <div className="OrderReceipt__total">
        <span>{t('receipt.total')}</span>
        <span>${Number(totalPrice).toFixed(2)}</span>
      </div>
    </div>
  );
}; 