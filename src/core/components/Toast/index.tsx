import { toast, ToastOptions } from 'react-toastify';
// import {
//   FaInfo,
//   FaCheck,
//   FaExclamationTriangle,
//   FaBug,
//   FaExclamationCircle
// } from "react-icons/fa";
import { ToastType } from './types.d';

// const displayIcon = (type) => {
//   switch (type) {
//     case ToastType.SUCCESS:
//       return <FaCheck />;
//     case ToastType.INFO:
//       return <FaInfo />;
//     case ToastType.ERROR:
//       return <FaExclamationCircle />;
//     case ToastType.WARNING:
//       return <FaExclamationTriangle />;
//     default:
//       return <FaBug />;
//   }
// };

const showToast = (type: ToastType, message: string) => {
  const options: ToastOptions = {
    theme: 'colored',
    draggable: true,
    position: 'bottom-right',
    hideProgressBar: type === ToastType.ERROR,
    autoClose: type === ToastType.ERROR ? false : 5000
  };
  toast[type](message, options);
};

const dismissToast = toast.dismiss;

export {
  // displayIcon,
  showToast,
  dismissToast
};
