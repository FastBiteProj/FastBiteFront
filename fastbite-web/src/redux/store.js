import { configureStore } from '@reduxjs/toolkit';
import orderSlice from './reducers/orderSlice';
import authSlice from './reducers/authSlice';
import profileSlice from './reducers/profileSlice';
import paymentSlice from './reducers/paymentSlice';
import recaptchaSlice from './reducers/recaptchaSlice';
import productSlice from './reducers/productSlice';
import reservationSlice from './reducers/reservationSlice';
import languageSlice from './reducers/languageSlice';
export const store = configureStore({
  reducer: {
    auth: authSlice,
    order: orderSlice,
    profile: profileSlice,
    payment: paymentSlice,
    recaptcha: recaptchaSlice,
    products: productSlice,
    reservation: reservationSlice,
    language: languageSlice
  },   
});

export default store;
