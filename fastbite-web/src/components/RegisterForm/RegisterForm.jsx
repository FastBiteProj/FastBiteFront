import "./RegisterForm.css";
import { FaUser, FaLock, FaEnvelope, FaExclamationCircle } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { register } from "../../redux/reducers/authSlice";
import { fetchSiteKey } from "../../redux/reducers/recaptchaSlice";
import { useState, useEffect } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import successIcon from "../../assets/icons/confetti.apng";
import signUpUser from "../../models/signUpUser";
import { useTranslation } from 'react-i18next';

export const RegisterForm = ({ onLoginClick, closeModal }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [user, setUser] = useState(new signUpUser());
  const [successMessage, setSuccessMessage] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const siteKey = useSelector((state) => state.recaptcha.siteKey);
  const loading = useSelector((state) => state.recaptcha.loading);
  const error = useSelector((state) => state.recaptcha.error);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(fetchSiteKey())
      .unwrap()
      .catch((error) => {
        console.error("Error fetching Site Key in component:", error); 
      });
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [id]: value,
    }));
  };

  const handleRecaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (user.password !== user.confirmPassword) {
      setErrors({ confirmPassword: t('register.errors.passwordMatch') });
      return;
    }

    if (!captchaToken) {
      setErrors({ captcha: t('register.errors.captcha') });
      return;
    }

    try {
      const userData = { ...user, captchaToken };
      await dispatch(register(userData)).unwrap();
      setSuccessMessage(t('register.success'));
      setErrors({});
    } catch (err) {
      const errorData = JSON.parse(err.split('API Error: 400 Bad Request.')[1]);
      
      const fieldErrors = errorData.reduce((acc, error) => {
        acc[error.propertyName.toLowerCase()] = error.errorMessage;
        return acc;
      }, {});

      setErrors(fieldErrors);
    }
  };

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        closeModal();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [successMessage, closeModal]);

  return (
    <div className={`register-container ${successMessage ? "success" : ""}`}>
      <div className="register-left">
        {successMessage ? (
          <div className="success-message">
            <h1>{t('register.success')}</h1>
            <img src={successIcon} alt="Success" />
          </div>
        ) : (
          <form className="register-form-container" onSubmit={handleSubmit}>
            <h1>{t('register.title')}</h1>
            <div className="register-input-box">
              <input
                type="text"
                id="name"
                placeholder={t('register.fields.name')}
                value={user.name}
                onChange={handleInputChange}
                required
                className={errors.name ? 'error' : ''}
              />
              <FaUser className="register-icon" />
              {errors.name && (
                <div className="field-error-message">
                  <FaExclamationCircle className="error-icon" />
                  <span>{errors.name}</span>
                </div>
              )}
            </div>
            <div className="register-input-box">
              <input
                type="text"
                id="surname"
                placeholder={t('register.fields.surname')}
                value={user.surname}
                onChange={handleInputChange}
                required
                className={errors.surname ? 'error' : ''}
              />
              <FaUser className="register-icon" />
              {errors.surname && (
                <div className="field-error-message">
                  <FaExclamationCircle className="error-icon" />
                  <span>{errors.surname}</span>
                </div>
              )}
            </div>
            <div className="register-input-box">
              <input
                type="email"
                id="email"
                placeholder="Email"
                value={user.email}
                onChange={handleInputChange}
                required
                className={errors.email ? 'error' : ''}
              />
              <FaEnvelope className="register-icon" />
              {errors.email && (
                <div className="field-error-message">
                  <FaExclamationCircle className="error-icon" />
                  <span>{errors.email}</span>
                </div>
              )}
            </div>
            <div className="register-input-box">
              <input
                type="text"
                id="phoneNumber"
                placeholder="Phone Number"
                value={user.phoneNumber}
                onChange={handleInputChange}
                required
                className={errors.phoneNumber ? 'error' : ''}
              />
              <FaEnvelope className="register-icon" />
              {errors.phoneNumber && (
                <div className="field-error-message">
                  <FaExclamationCircle className="error-icon" />
                  <span>{errors.phoneNumber}</span>
                </div>
              )}
            </div>
            <div className="register-input-box">
              <input
                type="password"
                id="password"
                placeholder="Password"
                value={user.password}
                onChange={handleInputChange}
                required
                className={errors.password ? 'error' : ''}
              />
              <FaLock className="register-icon" />
              {errors.password && (
                <div className="field-error-message">
                  <FaExclamationCircle className="error-icon" />
                  <span>{errors.password}</span>
                </div>
              )}
            </div>

            <div className="register-input-box">
              <input
                type="password"
                id="confirmPassword"
                placeholder="Confirm Password"
                value={user.confirmPassword}
                onChange={handleInputChange}
                required
                className={errors.confirmPassword ? 'error' : ''}
              />
              <FaLock className="register-icon" />
              {errors.confirmPassword && (
                <div className="field-error-message">
                  <FaExclamationCircle className="error-icon" />
                  <span>{errors.confirmPassword}</span>
                </div>
              )}
            </div>

            {!loading && siteKey ? (
              <ReCAPTCHA
                sitekey={siteKey}
                onChange={handleRecaptchaChange}
              />
            ) : (
              <p>{t('register.loading')}</p>
            )}

            {error && <p>Error loading reCAPTCHA: {error}</p>} 
            {errors.general && (
              <div className="error-message">
                <FaExclamationCircle className="error-icon" />
                <span>{errors.general}</span>
              </div>
            )}
            <button type="submit">{t('register.buttons.signUp')}</button>
          </form>
        )}
      </div>
      <div className="register-right">
        <h2>{t('register.welcome.title')}</h2>
        <p>{t('register.welcome.message')}</p>
        <button onClick={onLoginClick}>{t('register.buttons.signIn')}</button>
      </div>
    </div>
  );
};
