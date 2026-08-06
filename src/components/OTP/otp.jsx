import React, { useState, useRef, useEffect } from 'react';
import { useAppTheme } from '../../hooks/useAppThem';

// nodeIntegration is on for this app (see index.js), so we can read the
// clipboard directly via Electron's API instead of relying solely on the
// DOM "paste" event, which can be swallowed before it reaches React in some
// Electron/Chromium combinations (e.g. when the accelerator-driven Edit >
// Paste menu item is used instead of a raw keypress).
let electronClipboard = null;
try {
  electronClipboard = window.require('electron').clipboard;
} catch (err) {
  // Not running inside Electron (e.g. isolated preview) — DOM paste still works.
}

const OtpInputs = ({ numInputs = 6, onChange }) => {
  const [otp, setOtp] = useState(new Array(numInputs).fill(''));
  const inputsRef = useRef([]);
  const {appColors} = useAppTheme()

  useEffect(() => {
    if (inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, [numInputs]);

  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (onChange) {
      onChange(newOtp.join(''));
    }

    if (value && index < numInputs - 1) {
      inputsRef.current[index + 1].focus();
    }
  };

  const applyPastedText = (text) => {
    const pastedData = (text || '')
      .replace(/\D/g, '')
      .slice(0, numInputs)
      .split('');

    if (pastedData.length === 0) return;

    const newOtp = [...otp];

    pastedData.forEach((digit, i) => {
      if (i < numInputs) {
        newOtp[i] = digit;
      }
    });

    setOtp(newOtp);

    if (onChange) {
      onChange(newOtp.join(''));
    }

    const lastFilledIndex = newOtp.findIndex((val) => !val);
    const focusIndex = lastFilledIndex !== -1 ? lastFilledIndex : numInputs - 1;

    if (inputsRef.current[focusIndex]) {
      inputsRef.current[focusIndex].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'v' && electronClipboard) {
      e.preventDefault();
      applyPastedText(electronClipboard.readText());
      return;
    }

    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputsRef.current[index - 1].focus();
    }

    if (e.key === 'ArrowRight' && index < numInputs - 1) {
      e.preventDefault();
      inputsRef.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    applyPastedText(e.clipboardData.getData('text'));
  };

  return (
    <div
      className="flex justify-center items-center gap-2 dtr"
      onPaste={handlePaste}
    >
      {otp.map((value, index) => (
        <input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          type="tel"
          maxLength="1"
          value={value}
          onChange={(e) => handleChange(e.target.value, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className="w-12 h-12 text-center text-lg border  rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{
            background: appColors.bgColor,
            borderColor: appColors.colorBorder
          }}
          inputMode="numeric"
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
};

export default OtpInputs;