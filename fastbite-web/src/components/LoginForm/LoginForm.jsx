import "./LoginForm.css";
import { FaLock, FaEnvelope, FaExclamationCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { login, togglePasswordVisibility } from "../../redux/reducers/authSlice";
import { useState } from "react";
import successIcon from "../../assets/icons/confetti.apng";
import { useEffect } from "react";
import signInUser from "../../models/signInUser";
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const LoginForm = ({ onRegisterClick, closeModal, onPasswordRecoveryClick }) => {
  const dispatch = useDispatch();
  const [user, setUser] = useState(new signInUser());
  const [successMessage, setSuccessMessage] = useState("");
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { 
    error, 
    isAuthenticated, 
    user: authUser, 
    showPassword 
  } = useSelector((state) => state.auth);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [id]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(user));
  };

  const getErrorMessage = (error) => {
    try {
      // Если ошибка приходит в виде строки JSON
      if (typeof error === 'string' && error.includes('API Error')) {
        const errorObj = JSON.parse(error.split('API Error: 400 Bad Request.')[1]);
        
        // Проверяем наличие ошибки валидации пароля
        if (errorObj.errorCode === 'RegularExpressionValidator') {
          return t('auth.login.error.passwordFormat');
        }
        
        // Возвращаем сообщение об ошибке из API
        if (errorObj.errorMessage) {
          return errorObj.errorMessage;
        }
      }
      
      // Для других типов ошибок
      if (Array.isArray(error)) {
        const err = error[0];
        if (err.propertyName === 'Password' && err.errorCode === 'RegularExpressionValidator') {
          return t('auth.login.error.passwordFormat');
        }
      }
      
      return t('auth.login.error.general');
    } catch (e) {
      return t('auth.login.error.general');
    }
  };

  useEffect(() => {
    if (isAuthenticated && authUser) {
      setSuccessMessage("Welcome back!");
      
      if (authUser.roles === 'AppAdmin') {
        setTimeout(() => {
          closeModal();
          navigate('/admin');
        }, 2000);
      } else {
        setTimeout(() => {
          closeModal();
        }, 2000);
      }
    }
  }, [isAuthenticated, navigate, closeModal, authUser]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        closeModal();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [successMessage, closeModal]);

  return (
    <div className={`login-container ${successMessage ? "success" : ""}`}>
      <div className="login-left">
        {successMessage ? (
          <div className="success-message">
            <h1>{t('auth.login.successMessage')}</h1>
            <img src={successIcon} alt="Success" />
          </div>
        ) : (
          <form className="login-form-container" onSubmit={handleSubmit}>
            <h1>{t('auth.login.title')}</h1>
            <div className="login-input-box">
              <input
                type="email"
                id="email"
                placeholder={t('auth.login.email')}
                value={user.email}
                onChange={handleInputChange}
                required
              />
              <FaEnvelope className="login-icon" />
            </div>
            <div className="login-input-box">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder={t('auth.login.password')}
                value={user.password}
                onChange={handleInputChange}
                required
              />
              <FaLock className="login-icon" />
              <button
                type="button"
                className="password-toggle"
                onClick={() => dispatch(togglePasswordVisibility())}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <button type="submit">{t('auth.login.signIn')}</button>
            <div className="login-forgot-password">
              <button type="button" onClick={onPasswordRecoveryClick}>
                {t('auth.login.forgotPassword')}
              </button>
            </div>
            {error && (
              <div className="error-message">
                <FaExclamationCircle className="error-icon" />
                <span>{getErrorMessage(error)}</span>
              </div>
            )}
          </form>
        )}
      </div>
      {!successMessage && (
        <div className="login-right">
          <h2>{t('auth.login.welcomeBack')}</h2>
          <p>{t('auth.login.keepConnected')}</p>
          <button onClick={onRegisterClick}>{t('auth.login.signUp')}</button>
        </div>
      )}
    </div>
  );
};
