import "./Modal.css";

const Modal = ({ isOpen, closeModal, content }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={closeModal}>
          &times;
        </button>
        <div>{content}</div>
      </div>
    </div>
  );
};
 
export default Modal;
