import './App.css'
import { HomePage, MenuPage, ProfilePage, ReservePage, OrderPage, ReserveHistory, OrdersHistory, AdminPanelMainPage } from './pages'
import {Route, Routes} from 'react-router-dom'
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { refreshToken } from './redux/reducers/authSlice';

function App() {

  const dispatch = useDispatch();

  useEffect(() => {
    if (localStorage.getItem('isAuthenticated') === 'true') {
      dispatch(refreshToken());
    }
  }, [dispatch]);

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage/>}/>
        <Route path="/admin" element={<AdminPanelMainPage/>}/>
        <Route path="/reserve" element={<ReservePage/>}/>
        <Route path="profile" element={<ProfilePage/>}/>
        <Route path="/menu" element={<MenuPage/>}/>
        <Route path="/order" element={<OrderPage/>}/>
        <Route path="/reserve-history" element={<ReserveHistory/>}/>
        <Route path="/orders-history" element={<OrdersHistory/>}/>

      </Routes>
    </>
  )
}

export default App
