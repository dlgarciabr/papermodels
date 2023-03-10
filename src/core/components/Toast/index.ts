import { toast, ToastOptions } from 'react-toastify';
import { ToastType } from './types.d';

const showToast = (type: ToastType, message: string) => {
  const options: ToastOptions = {
    theme: 'colored',
    draggable: true,
    position: 'bottom-right',
    autoClose: type === ToastType.ERROR ? 20000 : 5000
  };
  toast[type](message, options);
};

const dismissToast = toast.dismiss;

export { showToast, dismissToast };
