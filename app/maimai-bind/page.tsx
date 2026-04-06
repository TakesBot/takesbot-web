'use client';

import { Suspense, useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MethodSelector } from './components/MethodSelector';
import { MessageAlert } from './components/MessageAlert';
import { DivingFishForm } from './components/DivingFishForm';
import { LxnsSection } from './components/LxnsSection';
import { Footer } from './components/Footer';
import { API_BASE_URL } from './lib/config';

type BindStep = 'selection' | 'diving-fish' | 'lxns';

function BindPageContent() {
  const [currentStep, setCurrentStep] = useState<BindStep>('selection');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isHere, setIsHere] = useState(false);
  const [authCodeInput, setAuthCodeInput] = useState('');
  const [verifiedAuthCode, setVerifiedAuthCode] = useState('');
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsHere(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleBack = () => {
    setMessage(null);
    setCurrentStep('selection');
  };

  const handleVerifyAuthCode = async () => {
    const code = authCodeInput.trim();

    if (!code) {
      setMessage({ type: 'error', text: '请输入授权码' });
      return;
    }

    setIsCheckingAuth(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/maimai/bind/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auth_code: code }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.detail || result.message || '授权码校验失败');
      }

      setIsAuthVerified(true);
        setVerifiedAuthCode(code.toUpperCase());
      setCurrentStep('selection');
      setMessage({ type: 'success', text: '授权码验证成功，请继续选择绑定方式' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '授权码校验失败，请重试';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsCheckingAuth(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-[#F2F6FC] dark:bg-[#111318] text-[#1F1F1F] dark:text-[#E2E2E6] p-4 font-sans transition-colors duration-700 opacity-0 ${isHere ? 'opacity-100' : ''}`}>

      <div className="bg-white dark:bg-[#1E1F23] rounded-[32px] p-2 max-w-[560px] w-full mx-auto md:shadow-md md:shadow-black/5 dark:md:shadow-black/20 transition-all duration-500 ease-[cubic-bezier(0.2,0,0,1)] hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20">
        <div className="p-6 md:p-8">
          <Header />

          {/* 内容区 */}
          <div className="mt-4 min-h-[300px] relative">
            {message && (
              <div className="animate-scale-in origin-top">
                <MessageAlert type={message.type} text={message.text} />
              </div>
            )}

            {!isAuthVerified ? (
              <div className="animate-fade-in-up space-y-5">
                <div className="bg-[#F0F4FC] dark:bg-[#282A2F] rounded-[24px] p-6">
                  <h2 className="text-[22px] font-normal text-[#1F1F1F] dark:text-[#E2E2E6] mb-2">输入授权码</h2>
                  <p className="text-sm text-[#444746] dark:text-[#C4C7C5] leading-relaxed mb-5">
                    请填写机器人发送给你的授权码，校验通过后才能继续绑定流程。
                  </p>
                  <div className="relative group">
                    <input
                      type="text"
                      value={authCodeInput}
                      onChange={(e) => setAuthCodeInput(e.target.value)}
                      className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-[#1F1F1F] dark:text-[#E2E2E6] bg-transparent rounded-lg border border-[#747775] dark:border-[#8E918F] appearance-none focus:outline-none focus:ring-0 focus:border-[#00639B] dark:focus:border-[#A8C7FA] focus:border-2 peer h-[56px] transition-colors"
                      placeholder=" "
                    />
                    <label className="absolute text-sm text-[#747775] dark:text-[#C4C7C5] duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-[#1E1F23] px-2 peer-focus:px-2 peer-focus:text-[#00639B] dark:peer-focus:text-[#A8C7FA] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1 font-medium bg-opacity-0 peer-focus:bg-white dark:peer-focus:bg-[#1E1F23]">
                      授权码
                    </label>
                  </div>
                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleVerifyAuthCode}
                      disabled={isCheckingAuth || !authCodeInput.trim()}
                      className="bg-[#00639B] dark:bg-[#A8C7FA] text-white dark:text-[#003258] text-sm font-medium py-3 px-8 rounded-full hover:bg-[rgba(0,99,155,0.92)] dark:hover:bg-[#D3E3FD] hover:shadow-md transition-all disabled:opacity-50 disabled:shadow-none min-w-[120px] active:scale-[0.98] transform"
                    >
                      {isCheckingAuth ? '校验中' : '验证授权码'}
                    </button>
                  </div>
                </div>
                <div className="text-center text-[11px] text-[#747775] dark:text-[#8E918F] leading-relaxed">
                  授权码是机器人发给你的 QQ 号哈希值，验证通过后才会开放绑定方式选择。
                </div>
              </div>
            ) : (
              <>
                {/* 选择步骤 */}
                {currentStep === 'selection' && (
                  <div className="animate-fade-in-up">
                    <MethodSelector onSelect={setCurrentStep} />
                  </div>
                )}

                {/* 水鱼绑定 */}
                {currentStep === 'diving-fish' && (
                  <div className="animate-fade-in-right">
                    <DivingFishForm
                      authCode={verifiedAuthCode}
                      onSuccess={(syname) => setMessage({ type: 'success', text: `绑定成功！玩家名：${syname}` })}
                      onError={(errorMsg) => setMessage({ type: 'error', text: errorMsg })}
                      onStartSubmit={() => setMessage(null)}
                      onBack={handleBack}
                    />
                  </div>
                )}

                {/* 落雪绑定 */}
                {currentStep === 'lxns' && (
                  <div className="animate-fade-in-right">
                    <LxnsSection
                      authCode={verifiedAuthCode}
                      onError={(errorMsg) => setMessage({ type: 'error', text: errorMsg })}
                      onBack={handleBack}
                    />
                  </div>
                )}
              </>
            )}

          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}

export default function MaimaiBindPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F2F6FC] dark:bg-[#111318]">
        <div className="text-[#444746] dark:text-[#C4C7C5] text-lg font-medium animate-pulse">加载中...</div>
      </div>
    }>
      <BindPageContent />
    </Suspense>
  );
}
