// 화면의 상태를 결정하고 컴포넌트를 전환하는 컨트롤러

import { useState } from "react";
import { VoiceMicButton } from "./VoiceMicButton";
import { VoiceIdle } from "./VoiceIdle";
import { VoiceRecording } from "./VoiceRecording";
import { VoiceLoading } from "./VoiceLoading";
import { VoiceResult } from "./VoiceResult"; // ✅ VoiceResult 폴더의 index.tsx를 자동으로 부릅니다.
import { ImageWithFallback } from "./figma/ImageWithFallback";

// 음성 비서의 4가지 상태를 정의
export type VoiceStatus = "idle" | "listening" | "loading" | "result";

// ✅ 나중에 API 연동 시 이 목 데이터는 전역 상수 파일로 옮겨야 함.
const MOCK_BUSES = [
  { id: "r1", busNumber: "146", direction: "삼성역방면", arrivalMin: 2, currentStop: "삼성역" },
  { id: "r2", busNumber: "341", direction: "역삼역방면", arrivalMin: 5, currentStop: "역삼역" },
  { id: "r3", busNumber: "360", direction: "교대역방면", arrivalMin: 8, currentStop: "교대역" },
];

export function VoiceAssistant() {
  // 현재 상태, 인식된 텍스트, 목적지를 상태로 관리
  const [status, setStatus] = useState<VoiceStatus>("idle"); // 기본 상태 = IDLE
  const [transcript, setTranscript] = useState("");
  const [destination, setDestination] = useState("");

  // 마이크 버튼을 처음 눌렀을 때 (인식 시작)
  const handleStart = () => { 
    setStatus("listening"); // listening 상태 전환
    setTranscript("듣고 있습니다..."); 
  };
  // 마이크 버튼을 다시 눌렀을 때 (인식 종료 및 경로 탐색)
  const handleStop = () => { 
    setStatus("loading"); // Loading 상태 전환
    // 2초 뒤 결과를 보여주는 시뮬레이션 로직 (실제 적용 시 응답 수신까지 대기로 나중에 수정)
    setTimeout(() => { setStatus("result"); setDestination("강남역"); }, 2000); 
  };

  // '다시 말하기' 버튼 클릭 시 리셋 (VoiceResult/index.tsx)
  const handleReset = () => { setStatus("listening"); setTranscript("듣고 있습니다..."); setDestination(""); };
  // '처음으로' 버튼 클릭 시 초기화 (VoiceResult/index.tsx)
  const handleGoHome = () => { setStatus("idle"); setTranscript(""); setDestination(""); };

  

  return (
    <div className="w-full h-full relative overflow-hidden font-['Noto_Sans_KR']" style={{ background: "#1A66CC" }}>
      {/* 1. 결과 화면: status가 result일 때만 노출 */}
      {status === "result" ? (
        <VoiceResult 
          destination={destination} 
          buses={MOCK_BUSES} 
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
              <VoiceMicButton status={status} onClick={status === "idle" ? handleStart : handleStop} />
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