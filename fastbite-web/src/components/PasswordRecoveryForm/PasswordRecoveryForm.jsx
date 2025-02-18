import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendRecoveryCode, resetPassword, clearMessages } from "../../redux/reducers/authSlice";
import ForgotPassword from "../../models/forgotPassword";
import PasswordRecovery from "../../models/passwordRecovery";
import "./PasswordRecoveryForm.css";
import { useTranslation } from 'react-i18next';

export const PasswordRecoveryForm = ({ onClose, onBackToLogin }) => {
  const dispatch = useDispatch();
  const { successMessage, errorMessage, loading } = useSelector((state) => state.auth);
  const { t } = useTranslation();

  const [forgotPassword, setForgotPassword] = useState(new ForgotPassword());
  const [passwordRecovery, setPasswordRecovery] = useState(new PasswordRecovery());
  const [codeSent, setCodeSent] = useState(false);
  const [resendTimeout, setResendTimeout] = useState(0);
  const [verificationCode, setVerificationCode] = useState(["", "", "", ""]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setForgotPassword((prevUser) => ({
      ...prevUser,
      [id]: value,
    }));
  };

  const handleInputPasswordChange = (e) => {
    const { id, value } = e.target;
    setPasswordRecovery((prevPass) => ({
      ...prevPass,
      [id]: value,
    }));
  };

  const handleSendCode = async () => {
    await dispatch(sendRecoveryCode(forgotPassword.email));
    setCodeSent(true);
    setResendTimeout(60);
  };

  const handleCodeChange = (index, value) => {
    if (value.length <= 1) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);

      if (value && index < verificationCode.length - 1) {
        const nextInput = document.getElementById(`code-input-${index + 1}`);
        if (nextInput) {
          nextInput.focus();
        }
      }
    }
  };

  const handlePasswordReset = async () => {
    const completeCode = verificationCode.join("");
    if (passwordRecovery.newPassword === passwordRecovery.confirmNewPassword) {
      await dispatch(resetPassword({ ...passwordRecovery, verificationCode: completeCode }));
      setPasswordRecovery(new PasswordRecovery());
    } else {
      alert(t('auth.passwordRecovery.errors.passwordsNotMatch'));
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && verificationCode[index] === "" && index > 0) {
      document.querySelector(`#code-input-${index - 1}`).focus();
    }
  };

  useEffect(() => {
    let timer;
    if (resendTimeout > 0) {
      timer = setInterval(() => {
        setResendTimeout((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimeout]);


  useEffect(() => {
    return () => {
      dispatch(clearMessages());
    };
  }, [dispatch]);

  return (
    <div className="password-recovery-container">
      <h2>{t('auth.passwordRecovery.title')}</h2>
      {successMessage && <p className="s-message">{successMessage}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {!codeSent ? (
        <div>
          <p>{t('auth.passwordRecovery.enterEmail')}</p>
          <input
            type="email"
            id="email"
            value={forgotPassword.email}
            onChange={handleInputChange}
            placeholder={t('auth.passwordRecovery.emailPlaceholder')}
            required
          />
          <button className="send-code-button" onClick={handleSendCode} disabled={loading}>
            {loading ? t('auth.passwordRecovery.buttons.sending') : t('auth.passwordRecovery.buttons.sendCode')}
          </button>
        </div>
      ) : (
        <div>
          <p>{t('auth.passwordRecovery.enterCode')}</p>
          <div className="recovery-code-inputs">
            {verificationCode.map((code, index) => (
              <input
                key={index}
                id={`code-input-${index}`}
                type="text"
                value={code}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                maxLength="1"
                className="square-input"
              />
            ))}
          </div>
          <div className="password-inputs">
            <input
              type="password"
              id="newPassword"
              value={passwordRecovery.newPassword}
              onChange={handleInputPasswordChange}
              placeholder={t('auth.passwordRecovery.newPasswordPlaceholder')}
              required
            />
            <input
              type="password"
              id="confirmNewPassword"
              value={passwordRecovery.confirmNewPassword}
              onChange={handleInputPasswordChange}
              placeholder={t('auth.passwordRecovery.confirmPasswordPlaceholder')}
              required
            />
          </div>
          <div className="button-group-inline">
            <button className="send-code-button" onClick={handlePasswordReset} disabled={loading}>
              {loading ? t('auth.passwordRecovery.buttons.resetting') : t('auth.passwordRecovery.buttons.confirm')}
            </button>
            <button
              className="resend-code-button"
              onClick={handleSendCode}
              disabled={resendTimeout > 0 || loading}
            >
              {resendTimeout > 0 
                ? t('auth.passwordRecovery.buttons.resendCodeIn', { seconds: resendTimeout })
                : t('auth.passwordRecovery.buttons.resendCode')}
            </button>
          </div>
        </div>
      )}
      <div className="button-group">
        <button onClick={onClose}>{t('auth.passwordRecovery.buttons.close')}</button>
        <button onClick={onBackToLogin}>{t('auth.passwordRecovery.buttons.backToLogin')}</button>
      </div>
    </div>
  );
};