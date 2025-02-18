import { Navbar } from "../../components/Navbar/Navbar";
import "./HomePage.css";
import discountImg from "../../assets/icons/discount.png";
import orderFoodImg from "../../assets/icons/order-food.png";
import reservedImg from "../../assets/icons/reserved.png";
import restaurantImg from "../../assets/icons/restaurant.png";
import { useTranslation } from "react-i18next";

export const HomePage = () => {
  const { t } = useTranslation();

  return (
    <div className="HomePage">
      <div className="HomePage__background" />
      <div className="HomePage__content">
        <div></div>
        <div className="HomePage__headers">
          <span className="HomePage__desc">{t("home.tagline")}</span>
          <span className="HomePage__logo">FastBite</span>
        </div>
 
        <Navbar />
      </div>
      <div className="HomePage__app-info">
        <h2 className="HomePage__app-info-title">{t("home.whyChoose")}</h2>
        <p className="HomePage__app-info-text">{t("home.description")}</p>
        <ul className="HomePage__app-info-list">
          <li>
            <img src={restaurantImg} alt="" />
            {t("home.features.browseMenu")}
          </li>
          <li>
            <img src={reservedImg} alt="" />
            {t("home.features.reserveTable")}
          </li>
          <li>
            <img src={orderFoodImg} alt="" />
            {t("home.features.orderAhead")}
          </li>
          <li>
            <img src={discountImg} alt="" />
            {t("home.features.stayUpdated")}
          </li>
        </ul>
        <p className="HomePage__app-info-text">{t("home.finalNote")}</p>
      </div>
      <div className="HomePage__info">
        <h2 className="HomePage__info-title">{t("home.about.title")}</h2>
        <p className="HomePage__info-text">{t("home.about.description")}</p>
        <h3 className="HomePage__info-title">{t("home.contact.title")}</h3>
        <p className="HomePage__info-text">
          {t("home.contact.address")} <br />
          {t("home.contact.phone")} <br />
          {t("home.contact.email")}
        </p>
      </div>
    </div>
  );
};
