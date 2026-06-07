// 화면의 상태를 결정하고 컴포넌트를 전환하는 컨트롤러

import { useState, useEffect } from "react";
import { VoiceMicButton } from "./VoiceMicButton";
import { VoiceIdle } from "./VoiceIdle";
import { VoiceRecording, useVoiceRecorder } from "./VoiceRecording";
import { VoiceLoading } from "./VoiceLoading";
import { VoiceResult } from "./VoiceResult"; 
import { ImageWithFallback } from "./figma/ImageWithFallback";

// 음성 비서의 4가지 상태를 정의
export type VoiceStatus = "idle" | "listening" | "loading" | "result";

export function VoiceAssistant() {
  // 훅에서 제공하는 로직들을 가져옵니다.
  const { status: hookStatus, transcript, audioChunks, startRecording, stopRecording } = useVoiceRecorder();
  
  // 현재 상태, 인식된 텍스트, 목적지를 상태로 관리
  const [status, setStatus] = useState<VoiceStatus>("idle"); 
  const [destination, setDestination] = useState("");

  // 녹음 훅의 상태 변화에 따라 화면 상태 동기화
  useEffect(() => {
    if (hookStatus === "loading") {
      setStatus("loading");
      // 2초 뒤 결과를 보여주는 시뮬레이션 로직
      const timer = setTimeout(() => { setStatus("result"); setDestination("강남역"); }, 2000); 
      return () => clearTimeout(timer);
    } else {
      setStatus(hookStatus as VoiceStatus);
    }
  }, [hookStatus]);

  // 마이크 버튼 핸들러 (시작/종료)
  const handleToggle = () => {
    if (status === "idle") {
      startRecording();
    } else if (status === "listening") {
      stopRecording();
    }
  };

  // '다시 말하기' 버튼 클릭 시 리셋
  const handleReset = () => { startRecording(); };
  
  // '처음으로' 버튼 클릭 시 초기화
  const handleGoHome = () => { setStatus("idle"); setDestination(""); };

  return (
    <div className="w-full h-full relative overflow-hidden font-['Noto_Sans_KR']" style={{ background: "#1A66CC" }}>
      {/* 1. 결과 화면: status가 result일 때만 노출 */}
      {status === "result" ? (
        <VoiceResult 
          destination={destination} 
          audioChunks={audioChunks}
          onReset={handleReset} 
          onGoHome={handleGoHome} 
        />
      ) : (
        /* 2. 대기/인식/로딩 화면 레이아웃 */
        <div className="w-full h-full relative">
          {/* 캐릭터 이미지 (idle 상태에서만 배경으로 등장) */}
          {status === "idle" && (
            <div className="absolute left-0 bottom-0 pointer-events-none z-10" style={{ height: "105%", width: "59%" }}>
              <ImageWithFallback src="/image/Peek_Woman.png" className="h-full object-contain object-left-bottom drop-shadow-[6px_0px_12px_rgba(0,0,0,0.4)]" />
            </div>
          )}
          {/* 중앙 콘텐츠 영역 (정중앙 배치) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 gap-[20px] w-full max-w-[400px]">
            {/* 상단: 말풍선 또는 텍스트 안내 */}
            <div className="h-24 flex items-end justify-center">
              {status === "idle" && <VoiceIdle.SpeechBubble />}
              {status === "listening" && <p className="text-4xl font-black text-white text-center drop-shadow-lg leading-tight">말씀해 주세요</p>}
              {status === "loading" && <p className="text-2xl font-bold text-white animate-pulse">경로 찾는 중...</p>}
            </div>
            {/* 중단: 애니메이션 마이크 버튼 */}
            <div className="py-4 overflow-visible">
              <VoiceMicButton status={status} onClick={handleToggle} />
            </div>
            {/* 하단: 예시 문구, 인식 중인 텍스트, 로딩바 */}
            <div className="h-24 flex items-start justify-center">
              {status === "idle" && <VoiceIdle.Example />}
              {status === "listening" && <VoiceRecording transcript={transcript} />}
              {status === "loading" && <VoiceLoading />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}