import "./AdminPanelMainPage.css";
import { Greetings, ReservationsHistory, ButtonsBlock, OrdersHistory, Users, MenuList } from "../../components/AdminPanelComps";

export const AdminPanelMainPage = () => {
  
  return (
    <div className="admin-panel">
      <div className="admin-content">
        <div className="admin-comps div1">
          <Greetings />
          <ButtonsBlock />
        </div>
        <div className="admin-comps div3">
          <OrdersHistory />
        </div>

        <div className="admin-comps div4">
          <MenuList />
        </div>
        <div className="admin-comps div5">
          <ReservationsHistory />
        </div>
        <div className="admin-comps div6">
          <Users />
        </div>
        <div className="admin-comps div7"></div>

 
        
      </div>
    </div>
  );
};
  