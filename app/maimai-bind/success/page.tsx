'use client';

import { useState, useMemo, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const Layout = ({ children, isHere }: { children: React.ReactNode; isHere: boolean }) => (
  <div className={`min-h-screen flex items-center justify-center bg-[#F2F6FC] dark:bg-[#111318] text-[#1F1F1F] dark:text-[#E2E2E6] p-4 font-sans transition-colors duration-700 opacity-0 ${isHere ? 'opacity-100' : ''}`}>
    <div className="bg-white dark:bg-[#1E1F23] rounded-[32px] p-2 max-w-[560px] w-full mx-auto md:shadow-md md:shadow-black/5 dark:md:shadow-black/20 transition-all duration-500 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20">
      <div className="p-8 md:p-10 text-center">
          {children}
      </div>
    </div>
  </div>
);

function BindSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [isHere, setIsHere] = useState(false);
  const [closeText, setCloseText] = useState('完成');

  useEffect(() => {
    const timer = setTimeout(() => setIsHere(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    // 尝试关闭窗口
    try {
      window.opener = null;
      window.open('', '_self');
      window.close();
    } catch {
      // ignore
    }
    
    // 如果执行到这里说明窗口可能没关掉（或者正在关闭）
    // 修改按钮文字提示用户
    setCloseText('请手动关闭此页面');
  };

  // 从 URL 参数直接计算状态
  const { status, playerName, authCode, errorMessage, autoBindSuccess } = useMemo(() => {
    const statusParam = searchParams.get('status');
    const playerParam = searchParams.get('player');
    const codeParam = searchParams.get('code');
    const errorParam = searchParams.get('error');
    const autoBindParam = searchParams.get('auto_bind');

    if (statusParam === 'success') {
      return {
        status: 'success' as const,
        playerName: playerParam || '未知玩家',
        authCode: codeParam || '',
        errorMessage: '',
        autoBindSuccess: autoBindParam === '1',
      };
    } else if (statusParam === 'error') {
      return {
        status: 'error' as const,
        playerName: '',
        authCode: '',
        errorMessage: errorParam || '未知错误',
        autoBindSuccess: false,
      };
    }

    return {
      status: 'loading' as const,
      playerName: '',
      authCode: '',
      errorMessage: '',
      autoBindSuccess: false,
    };
  }, [searchParams]);

  const copyCode = async () => {
    if (!authCode) return;
    
    try {
      await navigator.clipboard.writeText(authCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      // 降级方案
      const textArea = document.createElement('textarea');
      textArea.value = authCode;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (e) {
        console.error('复制失败', e);
      }
      document.body.removeChild(textArea);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2F6FC] dark:bg-[#111318]">
        <div className="text-[#444746] dark:text-[#C4C7C5] text-lg font-medium animate-pulse">处理中...</div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <Layout isHere={isHere}>
          <div className="animate-scale-in origin-center">
            <div className="w-20 h-20 bg-[#FFDAD6] dark:bg-[#93000A] text-[#410002] dark:text-[#FFDAD6] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </div>
            <h1 className="text-[28px] font-normal text-[#1F1F1F] dark:text-[#E2E2E6] mb-4">绑定失败</h1>
            <p className="text-[#444746] dark:text-[#C4C7C5] mb-8 leading-relaxed text-sm">
                {errorMessage}
            </p>
            <button
                onClick={() => router.push('/maimai-bind')}
                className="bg-[#00639B] dark:bg-[#A8C7FA] text-white dark:text-[#003258] px-8 py-3.5 rounded-full text-sm font-medium hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md transition-all w-full md:w-auto min-w-[140px]"
            >
                返回重试
            </button>
          </div>
      </Layout>
    );
  }

  // 成功页面
  if (autoBindSuccess) {
    // 自动绑定成功
    return (
      <Layout isHere={isHere}>
         <div className="animate-fade-in-up stagger-1 opacity-0 fill-mode-forwards">
             <div className="w-20 h-20 bg-[#C4EDD0] dark:bg-[#00512B] text-[#00210E] dark:text-[#C4EDD0] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
             </div>
             <h1 className="text-[28px] font-normal text-[#1F1F1F] dark:text-[#E2E2E6] mb-2">绑定成功</h1>
             <div className="inline-block bg-[#F0F4FC] dark:bg-[#282A2F] text-[#00639B] dark:text-[#A8C7FA] px-4 py-1.5 rounded-full text-base font-medium mb-6">
                 {playerName}
             </div>
             <div className="text-[#444746] dark:text-[#C4C7C5] mb-8 text-sm leading-relaxed">
                 您的账号已成功关联至<span className="text-[#00639B] dark:text-[#A8C7FA] font-medium mx-1">落雪系统</span>
                 <br />现在可以返回 QQ 使用了
             </div>

             <button
                 onClick={handleClose}
                 className="bg-[#00639B] dark:bg-[#A8C7FA] text-white dark:text-[#003258] px-8 py-3.5 rounded-full text-sm font-medium hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md transition-all w-full"
             >
                 {closeText}
             </button>
         </div>
      </Layout>
    );
  } else {
    // 需要手动绑定
    return (
      <Layout isHere={isHere}>
        <div className="animate-fade-in-up stagger-1 opacity-0 fill-mode-forwards">
            <div className="w-20 h-20 bg-[#EADDFF] dark:bg-[#4F378B] text-[#21005D] dark:text-[#EADDFF] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            </div>
            <h1 className="text-[28px] font-normal text-[#1F1F1F] dark:text-[#E2E2E6] mb-2">授权成功</h1>
            <div className="text-[#444746] dark:text-[#C4C7C5] text-sm mb-8">
                当前玩家：<span className="font-medium text-[#1F1F1F] dark:text-[#E2E2E6]">{playerName}</span>
            </div>

            <div className="bg-[#F0F4FC] dark:bg-[#282A2F] rounded-[24px] p-6 mb-6 relative group border border-transparent hover:border-[#D3E3FD] dark:hover:border-[#005FA3] transition-colors">
                <div className="font-mono text-2xl font-medium text-[#1F1F1F] dark:text-[#E2E2E6] break-all tracking-wide mb-6 select-all text-center">
                    {authCode}
                </div>
                <button
                    onClick={copyCode}
                    className={`w-full py-3.5 rounded-full font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                        copySuccess
                            ? 'bg-[#C4EDD0] dark:bg-[#00512B] text-[#0A3818] dark:text-[#C4EDD0]'
                            : 'bg-[#D3E3FD] dark:bg-[#004A77] text-[#001D35] dark:text-[#C2E7FF] hover:shadow-md'
                    }`}
                >
                     {copySuccess ? (
                        <>
                             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                             <span>已复制</span>
                        </>
                     ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                         <span>复制绑定令牌</span>
                        </>
                     )}
                </button>
            </div>

            <div className="bg-[#FFF8F3] dark:bg-[#3E2D12] text-[#553F00] dark:text-[#FFDCBB] p-4 rounded-[16px] text-left mb-6">
                <div className="flex items-start gap-3">
                     <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                         <p className="text-xs font-medium mb-1.5 opacity-80">下一步操作</p>
                         <p className="text-sm">
                    <span className="bg-[#FFDCBB] dark:bg-[#584424] px-1.5 rounded inline-block mt-1 select-all">请返回绑定页继续完成后续绑定</span>
                         </p>
                    </div>
                </div>
            </div>

            <div className="text-center text-[11px] text-[#747775] dark:text-[#8E918F]">
              绑定令牌有效期为 1 小时，请尽快完成绑定
            </div>
        </div>
      </Layout>
    );
  }
}

export default function BindSuccessPage() {
  return (
    <Suspense fallback={
       <div className="min-h-screen flex items-center justify-center bg-[#F2F6FC] dark:bg-[#111318]">
        <div className="text-[#444746] dark:text-[#C4C7C5] text-lg font-medium animate-pulse">处理中...</div>
      </div>
    }>
      <BindSuccessContent />
    </Suspense>
  );
}
