import "./Navbar.css";
import { useSelector } from "react-redux";
import { useState } from "react";
import { LoginForm } from "../LoginForm/LoginForm";
import { RegisterForm } from "../RegisterForm/RegisterForm";
import { PasswordRecoveryForm } from "../PasswordRecoveryForm/PasswordRecoveryForm";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

export const Navbar = () => {
  const { t, i18n } = useTranslation();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const order = useSelector((state) => state.order.order);
  const orderCount = order.length;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  const handleLoginClick = () => {
    setIsModalOpen(true);
    setIsRegister(false);
    setIsPasswordRecovery(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsRegister(false);
    setIsPasswordRecovery(false);
  };

  const changeLanguage = (event) => {
    i18n.changeLanguage(event.target.value);
  };
 
  return (
    <>
      <nav className="Navbar">
      <div className="Navbar__item">
          <Link to="/">
            <button className="Navbar__item-button">{t('navbar.home')}</button>
          </Link>
        </div>
        <div className="Navbar__item">
          <Link to="/menu">
            <button className="Navbar__item-button">{t('navbar.menu')}</button>
          </Link>
        </div>
        <div className="Navbar__item">
          <Link to="/reserve">
            <button className="Navbar__item-button">{t('navbar.booking')}</button>
          </Link>
        </div>
        <div className="Navbar__item">
          <Link to="/order">
            <button className="Navbar__item-button">
              {t('navbar.order')} {orderCount > 0 && <span className="order-count">{orderCount}</span>}
            </button>
          </Link>
        </div>

        {!isAuthenticated && (
          <div className="Navbar__item">
            <button className="Navbar__item-button" onClick={handleLoginClick}>
              {t('navbar.login')}
            </button>
          </div>
        )}

        {isAuthenticated && (
          <div className="Navbar__item">
            <Link to="/profile">
              <button className="Navbar__item-button">{t('navbar.profile')}</button>
            </Link>
          </div>
        )}
        <div className="language-select-container">
          <select
            className="language-select"
            value={i18n.language}
            onChange={changeLanguage}
            aria-label="Select language"
          >
            <option value="en">EN</option>
            <option value="ru">RU</option>
            <option value="az">AZ</option>
          </select>
        </div>
      </nav>

      {isModalOpen && (
        <div className="login-modal-overlay" onClick={closeModal}>
          <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
            {!isRegister && !isPasswordRecovery && (
              <LoginForm
                onRegisterClick={() => setIsRegister(true)}
                closeModal={closeModal}
                onPasswordRecoveryClick={() => setIsPasswordRecovery(true)}
              />
            )}
            {isPasswordRecovery && (
              <PasswordRecoveryForm
                onClose={closeModal}
                onBackToLogin={() => {
                  setIsPasswordRecovery(false);
                  setIsRegister(false);
                }}
              />
            )}
            {isRegister && (
              <RegisterForm 
                onLoginClick={() => {
                  setIsRegister(false);
                  setIsPasswordRecovery(false);
                }} 
                onClose={closeModal} 
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};
