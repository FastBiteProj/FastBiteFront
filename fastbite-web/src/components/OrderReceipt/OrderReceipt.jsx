import { useTranslation } from 'react-i18next';
import React from 'react';
import './OrderReceipt.css';

export const OrderReceipt = ({ order, totalPrice, language }) => {
  const { t } = useTranslation();

  const getTranslation = (product) => {
    if (!product.translations || product.translations.length === 0) {
      return { name: "N/A", description: "" };
    }
    const translation = product.translations.find(
      (t) => t.languageCode === language
    );
    return translation || product.translations[0];
  };

  const getCurrentDateTime = () => {
    return new Date().toLocaleString(language === 'az' ? 'az-AZ' : language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const orderItems = Array.isArray(order) ? order : [];

  return (
    <div className="OrderReceipt">
      <div className="OrderReceipt__header">
        <h2>{t('receipt.title')}</h2>
        <p className="OrderReceipt__datetime">{getCurrentDateTime()}</p>
      </div>

      <div className="OrderReceipt__content">
        <table className="OrderReceipt__table">
          <thead>
            <tr>
              <th>{t('receipt.table.number')}</th>
              <th>{t('receipt.table.item')}</th>
              <th>{t('receipt.table.price')}</th>
            </tr>
          </thead>
          <tbody>
            {orderItems.map((item, index) => (
              <tr key={item.uniqueID}>
                <td>{index + 1}</td>
                <td>{getTranslation(item).name}</td>
                <td>${item.totalPrice}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="2" className="OrderReceipt__total-label">
                {t('receipt.table.total')}:
              </td>
              <td className="OrderReceipt__total-amount">
                ${totalPrice.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="OrderReceipt__footer">
        <p>{t('receipt.thankYou')}</p>
        <p className="OrderReceipt__order-id">
          {t('receipt.orderId')}: {Math.random().toString(36).substr(2, 9).toUpperCase()}
        </p>
      </div>
    </div>
  );
}; 