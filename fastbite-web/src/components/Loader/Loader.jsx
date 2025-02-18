import { useEffect, useRef } from "react";
import Lottie from "lottie-react";
import loaderAnimation from "../../assets/icons/loader.json";
import './Loader.css'

const Loader = () => {
  const lottieRef = useRef(null);

  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.setSpeed(0.7);
    }
  }, []);
  return (
    <div className="loader-container">
      <Lottie animationData={loaderAnimation} lottieRef={lottieRef} loop={true}  className="loader"/>
    </div>
  );
}; 

export default Loader;
