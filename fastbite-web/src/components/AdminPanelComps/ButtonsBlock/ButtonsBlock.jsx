import './ButtonsBlock.css';
import Modal from '../Modal/Modal';
import { useState } from 'react';
import { AddDishForm } from '../Forms/AddDishForm/AddDishForm.jsx';
import { CreateReservationForm } from '../Forms/CreateReservationForm/CreateReservationForm.jsx';

export const ButtonsBlock = () => {
  const [isAddDishModalOpen, setIsAddDishModalOpen] = useState(false);
  const [isCreateReservationModalOpen, setIsCreateReservationModalOpen] = useState(false);

  const openAddDishModal = () => setIsAddDishModalOpen(true);
  const closeAddDishModal = () => setIsAddDishModalOpen(false);

  const openCreateReservationModal = () => setIsCreateReservationModalOpen(true);
  const closeCreateReservationModal = () => setIsCreateReservationModalOpen(false);

  return (
    <div className="buttons-block">
      <button className="btn-block add-dish" onClick={openAddDishModal}>
        Add Dish
      </button>

      <button className="btn-block add-reservation" onClick={openCreateReservationModal}>
        Create Reservation
      </button>



      <Modal 
        isOpen={isAddDishModalOpen}
        closeModal={closeAddDishModal}
        content={<AddDishForm closeModal={closeAddDishModal} />}
      />

      <Modal 
        isOpen={isCreateReservationModalOpen}
        closeModal={closeCreateReservationModal}
        content={<CreateReservationForm closeModal={closeCreateReservationModal} />}
      />

    </div>
  );
};
