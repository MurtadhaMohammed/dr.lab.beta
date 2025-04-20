import React, { useState, useEffect } from 'react';
import { Button, Card, Space, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import OtpInputs from '../../components/OTP/otp';
import Logo from '../../assets/logo2.png';
import background from '../../assets/login.svg';
import { apiCall } from '../../libs/api';
import { useAppStore } from '../../libs/appStore';
import BackIcon from '../LoginScreen/BackIcon';

const OTPScreen = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [countdown, setCountdown] = useState(0);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setIsLogin } = useAppStore();

  useEffect(() => {
    const storedPhone = localStorage.getItem('verification_phone');
    if (storedPhone) {
      setPhone(storedPhone);
    } else {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleOtpChange = (value) => {
    setOtp(value);
  };

  const handleBackToLogin = () => {
    localStorage.removeItem('verification_phone');
    localStorage.removeItem('userId');
    window.location.reload();
  };

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      message.error(t('PleaseEnterValidOTP'));
      return;
    }

    setLoading(true);
    try {
      const resp = await apiCall({
        method: 'POST',
        pathname: '/app/verify-otp',
        data: {
          otp,
          phone,
        },
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data.success) {
          message.success(t('OTPVerifiedSuccessfully'));
          
          // Store user data and token
          if (data.token && data.user) {
            localStorage.setItem('lab-user', JSON.stringify(data.user));
            localStorage.setItem('lab_token', data.token);
            localStorage.removeItem('verification_phone');
            localStorage.removeItem('userId');
            
            setIsLogin(true);
            navigate('/');
          } else {
            throw new Error(t('DataMissingOrIncomplete'));
          }
        } else {
          throw new Error(data.message || t('VerificationFailed'));
        }
      } else {
        const errorData = await resp.json();
        message.error(errorData.error || t('InvalidOTP'));
      }
    } catch (error) {
      // If it's a network error, show a specific message
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        message.error(t('NetworkError'));
      } else {
        message.error(error.message || t('ErrorVerifyingOTP'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    try {
      const resp = await apiCall({
        method: 'POST',
        pathname: '/app/resend-otp',
        data: {
          phone,
        },
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data.success) {
          message.success(t('OTPResentSuccessfully'));
          // Start 60-second countdown
          setCountdown(60);
        } else {
          message.warning(data.message);
        }
      } else {
        const errorData = await resp.json();
        message.error(errorData.error || t('FailedToResendOTP'));
        
        // If maximum resend attempts reached, redirect to login
        if (errorData.error?.includes('Maximum OTP resend attempts')) {
          localStorage.removeItem('verification_phone');
          localStorage.removeItem('userId');
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      }
    } catch (error) {
      // If it's a network error, show a specific message
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        message.error(t('NetworkError'));
      } else {
        message.error(t('ErrorResendingOTP'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="h-screen flex items-center justify-center bg-gradient-to-r from-violet-600 to-[#ff0000]"
      style={{
        backgroundImage: `url(${background})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Card
        className="-mt-[80px]"
        title={<BackIcon className="cursor-pointer" onClose={handleBackToLogin} />}
        styles={{
          header: {
            padding: 16,
            overflow: 'hidden',
          },
          body: {
            padding: 32,
          },
        }}
      >
        <Space direction="vertical" size={32} className="w-96 h-full">
          <div className="w-full flex flex-col items-center">
            <img src={Logo} className="w-[198px]" alt="Dr.Lab" />
            <div className="w-full text-center">
              <h1 className="text-2xl font-semibold mb-2">{t('EnterVerificationCode')}</h1>
              <p className="text-gray-600">
                {t('WeSentVerificationCodeTo')} {phone}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6">
            <OtpInputs numInputs={6} onChange={handleOtpChange} />
            
            <Button
              loading={loading}
              type="primary"
              block
              className="h-12"
              onClick={verifyOTP}
              disabled={otp.length !== 6}
            >
              {t('Verify')}
            </Button>

            <div className="text-center">
              <p className="text-gray-600">
                {t("DidntReceiveCode")}{' '}
                <span 
                  className={`${countdown > 0 ? 'text-gray-400' : 'text-[#3853A4] hover:cursor-pointer hover:text-[#0442ff]'}`}
                  onClick={countdown > 0 ? null : handleResendOTP}
                >
                  {countdown > 0 ? `${t('ResendIn')} ${countdown}s` : t('Resend')}
                </span>
              </p>
            </div>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default OTPScreen;
