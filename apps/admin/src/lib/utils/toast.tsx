import { toast } from "@cf/ui/components/sonner";

import { Alert } from "@/components/common/alert";

/**
 * Display an error toast notification
 * @param message - The error message to display
 */
export const showErrorToast = (message: string) => {
  return toast.error(message);
};

/**
 * Display a success toast notification
 * @param message - The success message to display
 */
export const showSuccessToast = (message: string) => {
  return toast.custom((t) => (
    <Alert
      onClose={() => toast.dismiss(t)}
      variant="success"
      description={message}
    />
  ));
};

/**
 * Display an info toast notification
 * @param message - The info message to display
 */
export const showInfoToast = (message: string) => {
  return toast.info(message);
};

/**
 * Display a warning toast notification
 * @param message - The warning message to display
 */
export const showWarningToast = (message: string) => {
  return toast.warning(message);
};
