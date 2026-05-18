"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_COUNTRY_DIAL } from "@/lib/countries";
import {
  COUNTRY_CHANGE_EVENT,
  getDefaultCountryDialCode,
  setDefaultCountryDialCode,
} from "@/lib/country-settings";

export function useCountryDial() {
  const [dialCode, setDialCode] = useState(DEFAULT_COUNTRY_DIAL);

  useEffect(() => {
    setDialCode(getDefaultCountryDialCode());

    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<{ dialCode: string }>).detail;
      if (detail?.dialCode) setDialCode(detail.dialCode);
      else setDialCode(getDefaultCountryDialCode());
    };

    window.addEventListener(COUNTRY_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(COUNTRY_CHANGE_EVENT, onChange);
  }, []);

  const setCountryDial = useCallback((code: string) => {
    setDefaultCountryDialCode(code);
    setDialCode(code.replace(/\D/g, ""));
  }, []);

  return { dialCode, setCountryDial };
}
