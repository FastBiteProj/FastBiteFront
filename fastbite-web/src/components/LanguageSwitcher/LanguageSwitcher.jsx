import { useTranslation } from 'react-i18next';
import "./LanguageSwitcher.css";

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (event) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <select onChange={changeLanguage} defaultValue={i18n.language}>
      <option value="en">English</option>
      <option value="ru">Русский</option>
      <option value="az">Azərbaycan</option>
    </select>
  );
}; 