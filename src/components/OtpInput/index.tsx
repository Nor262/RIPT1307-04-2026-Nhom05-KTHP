import React, { useRef, useState, useEffect } from 'react';
import styles from './index.less';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
}

const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  value,
  onChange,
  onComplete,
}) => {
  const [otpArray, setOtpArray] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Sync external value changes (e.g. reset)
    if (!value) {
      setOtpArray(Array(length).fill(''));
    } else {
      const arr = value.split('').slice(0, length);
      setOtpArray([...arr, ...Array(length - arr.length).fill('')]);
    }
  }, [value, length]);

  const focusInput = (index: number) => {
    if (index >= 0 && index < length) {
      inputRefs.current[index]?.focus();
    }
  };

  const handleTextChange = (text: string, index: number) => {
    const numericText = text.replace(/[^0-9]/g, '');
    const newOtp = [...otpArray];
    newOtp[index] = numericText.substring(numericText.length - 1); // Only take last digit
    setOtpArray(newOtp);

    const combinedValue = newOtp.join('');
    onChange(combinedValue);

    if (numericText && index < length - 1) {
      focusInput(index + 1);
    }

    if (combinedValue.length === length && onComplete) {
      onComplete(combinedValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!otpArray[index] && index > 0) {
        focusInput(index - 1);
      } else {
        const newOtp = [...otpArray];
        newOtp[index] = '';
        setOtpArray(newOtp);
        onChange(newOtp.join(''));
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, length);
    if (pastedData) {
      const newOtp = [...otpArray];
      pastedData.split('').forEach((char, idx) => {
        newOtp[idx] = char;
      });
      setOtpArray(newOtp);
      const combined = newOtp.join('');
      onChange(combined);
      focusInput(Math.min(pastedData.length, length - 1));
      if (combined.length === length && onComplete) {
        onComplete(combined);
      }
    }
  };

  return (
    <div className={styles.otpWrapper}>
      {otpArray.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => (inputRefs.current[idx] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          onChange={(e) => handleTextChange(e.target.value, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          onPaste={handlePaste}
          className={`${styles.otpBox} ${digit ? styles.filled : ''}`}
        />
      ))}
    </div>
  );
};

export default OtpInput;
