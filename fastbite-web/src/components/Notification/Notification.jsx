import './Notification.css';

export const Notification = ({ message, visible }) => {
  return (
    <div className={`notification ${visible ? 'visible' : ''}`}>
      {message}
    </div>
  );
};
