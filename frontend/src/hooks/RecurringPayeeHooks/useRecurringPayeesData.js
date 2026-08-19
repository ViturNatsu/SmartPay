import {useState} from "react";
import {getRecurringPayees} from "@/api/recurringPayment/recurringPayeeApi.js";

export const useRecurringPayeesData = () => {

  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState(null);

  const getRecurringPayeesData = async () => {

    setIsRequesting(true);
    setError(null);

    try {
      return await getRecurringPayees();
    }
    catch (err) {
      setError(err?.response?.data?.message || err.message || "Something went wrong");
      throw err;
    }
    finally {
      setIsRequesting(false);
    }
  }

  return {
    handlers: {
      getRecurringPayeesData,
    },
    state: {
      isRequesting,
      error,
    },
  };
}