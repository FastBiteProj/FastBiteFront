import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useDispatch } from "react-redux";
import { useNavigate } from 'react-router-dom';
import { logout } from "../../redux/reducers/authSlice";
import "./LogoutModal.css";

export const LogoutModal = ({ closeModal }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isClosing, setIsClosing] = useState(false);

  const handleLogout = async () => {
    try {
      console.log('Starting logout process...');
      setIsClosing(true);
      
      await dispatch(logout()).unwrap();
      
      closeModal();
      
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      setIsClosing(false);
    }
  };

  return (
    <div className={`LogoutModal ${isClosing ? 'closing' : ''}`}>
      <div className='LogoutModal__content'>
        <h3>{t('logout.title')}</h3>
        <div className='LogoutModal__buttons'>
          <button
            className='LogoutModal__yes-no'
            onClick={handleLogout}
            disabled={isClosing}
          >
            {t('logout.buttons.confirm')}
          </button>
          <button
            className='LogoutModal__yes-no'
            onClick={closeModal}
            disabled={isClosing}
          >
            {t('logout.buttons.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};