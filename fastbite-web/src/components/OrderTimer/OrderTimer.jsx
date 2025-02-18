import { useState, useEffect } from 'react';
import './OrderTimer.css';
import { useTranslation } from 'react-i18next';

export const OrderTimer = ({ timestamp, onExpire }) => {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState({ minutes: 1, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now();
      const timePassed = now - timestamp;
      const timeLeftMs = Math.max(15 * 60 * 1000 - timePassed, 0);
      
      const minutes = Math.floor(timeLeftMs / (1000 * 60));
      const seconds = Math.floor((timeLeftMs % (1000 * 60)) / 1000);

      return { minutes, seconds };
    };

    setTimeLeft(calculateTimeLeft());

    const intervalId = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
        onExpire();
        clearInterval(intervalId);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timestamp, onExpire]);

  const getTimerColor = () => {
    const totalSeconds = timeLeft.minutes * 60 + timeLeft.seconds;
    if (totalSeconds > 40) return '#F4D03F';   
    if (totalSeconds > 20) return '#FFA726'; 
    return '#FF5252';
  };

  return (
    <div className="OrderTimer">
      <div className="OrderTimer__label">{t('order.timeRemaining')}:</div>
      <div className="OrderTimer__time" style={{ color: getTimerColor() }}>
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </div>
      <div className="OrderTimer__progress">
        <div 
          className="OrderTimer__progress-bar"
          style={{
            width: `${((timeLeft.minutes * 60 + timeLeft.seconds) / (1 * 60)) * 100}%`,
            backgroundColor: getTimerColor()
          }}
        />
      </div>
    </div>
  );
}; 