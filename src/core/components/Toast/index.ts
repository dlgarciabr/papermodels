import { toast, ToastOptions } from 'react-toastify';
import { ToastType } from './types.d';

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

export { showToast, dismissToast };
