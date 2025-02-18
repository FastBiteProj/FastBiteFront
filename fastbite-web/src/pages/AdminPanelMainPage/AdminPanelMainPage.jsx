import "./AdminPanelMainPage.css";
import { Greetings, ReservationsHistory, ButtonsBlock, OrdersHistory, Users, MenuList } from "../../components/AdminPanelComps";

export const AdminPanelMainPage = () => {
  
  return (
    <div className="admin-panel">
      <div className="admin-content">
        <div className="admin-comps one-frame">
          <Greetings />
        </div>
        <div className="admin-comps two-frame">
          <OrdersHistory />
        </div>
        <div className="admin-comps one-frame">
          <ButtonsBlock />
        </div>
        <div className="admin-comps one-frame vertical">
          <MenuList />
        </div>
        <div className="admin-comps two-frame">
          <ReservationsHistory />
        </div>
        <div className="admin-comps one-frame vertical">
          <Users />
        </div>


        
      </div>
    </div>
  );
};
  