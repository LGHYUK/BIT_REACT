import { BusInfoList } from "./components/BusInfoList";
// 1. 기존 VoiceGuide 대신 새로 만든 부모 컴포넌트인 VoiceAssistant를 불러옵니다.
import { VoiceAssistant } from "./components/VoiceAssistant"; 

export default function App() {
  return (
    <div className="size-full flex flex-col max-w-[800px] mx-auto bg-white" style={{ aspectRatio: '10/16' }}>
      
      {/* 위쪽 - 버스 정보 (정확히 60% 높이 고정, 축소 방지) */}
      <div className="h-[60%] w-full shrink-0 overflow-hidden">
        <BusInfoList />
      </div>
      
      {/* 아래쪽 - 음성인식 안내 및 결과 (정확히 40% 높이 고정, 축소 방지) */}
      <div className="h-[40%] w-full shrink-0 overflow-hidden relative">
        <VoiceAssistant />
      </div>
    </div>
  );
}