import toast from "react-hot-toast";

export const successToast = (msg) => toast.success(msg);
export const errorToast = (msg) => toast.error(msg || "Something went wrong");
