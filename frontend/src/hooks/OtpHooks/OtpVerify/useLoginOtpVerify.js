import {createNewCardRequest} from "@/api/cardrequest/cardrequestApi.js";
import {useOtpVerify} from "@/hooks/OtpHooks/OtpVerify/OtpVerifyBase/useOtpVerify.js";
import {useState} from "react";
import {useAuth} from "@/context/AuthContext.jsx";


export const useLoginOtpVerify = () => {

  const { setAuthFromTokens, tokenClaims } = useAuth();

  const {
    sendOtpVerify: SourceSendOtpVerify,
    loading,
    error,
    reset,
  } = useOtpVerify();

  const sendOtpVerify = async ({email, code}) => {
    SourceSendOtpVerify({
      email: email,
      code,
      type: "login",
    }).then((r) => {

    });
  }

  return {
    sendOtpVerify,
    loading,
    error,
    reset,
  }



}