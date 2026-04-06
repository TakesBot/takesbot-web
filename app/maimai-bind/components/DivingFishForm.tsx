import React, { useState } from 'react';
import { API_BASE_URL } from '../lib/config';

interface DivingFishFormProps {
  authCode: string;
  onSuccess: (syname: string) => void;
  onError: (message: string) => void;
  onStartSubmit: () => void;
  onBack: () => void;
}

export function DivingFishForm({ authCode, onSuccess, onError, onStartSubmit, onBack }: DivingFishFormProps) {
  const [divingFishToken, setDivingFishToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDivingFishBind = async () => {
    if (!authCode) {
      onError('缺少授权码，请返回上一步重新验证');
      return;
    }
    if (!divingFishToken.trim()) {
      onError('请输入水鱼查分器令牌');
      return;
    }

    onStartSubmit();
    setIsSubmitting(true);

    try {
      // 先验证水鱼令牌
      const verifyRes = await fetch('https://www.diving-fish.com/api/maimaidxprober/player/records', {
        headers: { 'Import-Token': divingFishToken.trim() }
      });
      
      if (!verifyRes.ok) {
        throw new Error('水鱼查分器令牌无效');
      }

      const userData = await verifyRes.json();
      const syname = userData.username;
      const sytoken = divingFishToken.trim()
      
      // 调用后端接口完成绑定
      const bindRes = await fetch(`${API_BASE_URL}/maimai/bind/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth_code: authCode,
          source: 'diving_fish',
          syname,
          sytoken,
          friend_code: null
        })
      });

      const result = await bindRes.json();
      
      if (bindRes.ok && result.success) {
        setDivingFishToken('');
        onSuccess(syname);
      } else {
        throw new Error(result.message || '绑定失败');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '绑定过程出错，请重试';
      onError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6 animate-fade-in-right stagger-1 opacity-0 fill-mode-forwards">
        <button 
          onClick={onBack}
          className="mr-3 w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/20 transition-colors text-[#444746] dark:text-[#C4C7C5]"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-[22px] font-normal text-[#1F1F1F] dark:text-[#E2E2E6]">水鱼查分器</h2>
      </div>

      <div className="bg-[#E1E1E1]/30 dark:bg-[#444746]/30 rounded-[16px] p-5 animate-fade-in-up stagger-2 opacity-0 fill-mode-forwards">
        <div className="flex items-start gap-3">
          <div className="text-[#00639B] dark:text-[#A8C7FA] mt-0.5">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
             <h3 className="text-sm font-medium text-[#1F1F1F] dark:text-[#E2E2E6] mb-1">
              如何获取 Token？
            </h3>
            <ol className="text-xs text-[#444746] dark:text-[#C4C7C5] space-y-1 list-decimal list-inside leading-relaxed">
              <li>访问 <a href="https://www.diving-fish.com/maimaidx/prober/" target="_blank" rel="noopener noreferrer" className="text-[#00639B] dark:text-[#A8C7FA] underline font-medium hover:text-[#004A77] dark:hover:text-[#D3E3FD] transition-colors">水鱼查分器</a></li>
              <li>「编辑个人资料」→「成绩导入Token」</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="pt-2 animate-fade-in-up stagger-3 opacity-0 fill-mode-forwards">
        <div className="relative group">
          <input
            type="text"
            id="token_input"
            value={divingFishToken}
            onChange={(e) => setDivingFishToken(e.target.value)}
            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-[#1F1F1F] dark:text-[#E2E2E6] bg-transparent rounded-lg border border-[#747775] dark:border-[#8E918F] appearance-none focus:outline-none focus:ring-0 focus:border-[#00639B] dark:focus:border-[#A8C7FA] focus:border-2 peer h-[56px] transition-colors"
            placeholder=" "
          />
          <label 
            htmlFor="token_input" 
            className="absolute text-sm text-[#747775] dark:text-[#C4C7C5] duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-[#1E1F23] px-2 peer-focus:px-2 peer-focus:text-[#00639B] dark:peer-focus:text-[#A8C7FA] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1 font-medium bg-opacity-0 peer-focus:bg-white dark:peer-focus:bg-[#1E1F23]"
          >
            查分器 Token
          </label>
        </div>
      </div>

      <div className="flex justify-end pt-4 animate-fade-in-up stagger-3 opacity-0 fill-mode-forwards">
        <button
          onClick={handleDivingFishBind}
          disabled={isSubmitting || !divingFishToken.trim()}
          className="bg-[#00639B] dark:bg-[#A8C7FA] text-white dark:text-[#003258] text-sm font-medium py-3 px-8 rounded-full hover:bg-[rgba(0,99,155,0.92)] dark:hover:bg-[#D3E3FD] hover:shadow-md transition-all disabled:opacity-50 disabled:shadow-none min-w-[100px] active:scale-[0.98] transform"
        >
          {isSubmitting ? '绑定中' : '绑定'}
        </button>
      </div>
    </div>
  );
}
