import { MapPin } from "lucide-react";
import { RouteDetail } from "../../../types/bus";

interface RouteDetailOverlayProps {
  route: RouteDetail;
  destination: string;
  onClose: () => void;
}

// 환승 구조 시 노선마다 색상 구분
const TRANSIT_THEMES = [
  { bg: "bg-blue-600", border: "border-blue-400", text: "text-blue-600" },
  { bg: "bg-purple-600", border: "border-purple-400", text: "text-purple-600" },
  { bg: "bg-orange-500", border: "border-orange-400", text: "text-orange-500" },
  { bg: "bg-emerald-600", border: "border-emerald-400", text: "text-emerald-600" },
  { bg: "bg-pink-600", border: "border-pink-400", text: "text-pink-600" },
];

export function RouteDetailOverlay({ route, destination }: RouteDetailOverlayProps) {
  // 환승 카운트 인덱스
  let transitColorIndex = 0;
  return (
    <div
      className="absolute inset-0 z-[100] bg-white text-gray-900 animate-in fade-in slide-in-from-right-5 duration-300 overflow-hidden font-['Noto_Sans_KR'] flex flex-col"
      style={{ width: "100%", height: "100%" }}
    >
      {/* ── 상단 고정 헤더 박스 (버스 번호, 소요 시간) ── */}
      <div className="flex items-center justify-between w-full pt-4 px-8 pb-3 bg-white shrink-0 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <span className="text-xl font-black text-gray-900 flex items-center">
            <span className="bg-blue-600 text-white px-4 py-1.5 rounded-lg font-mono text-2xl shadow-sm">
              {route.busNumber}번
            </span>
          </span>
        </div>

        {/* 소요 시간 박스 */}
        <div className="bg-yellow-50 border border-yellow-200 px-5 py-1.5 rounded-xl flex items-baseline gap-1 shadow-sm">
          <span className="text-yellow-700 text-xs font-bold mr-1">약</span>
          {route.totalMin >= 60 ? (
            <>
              <span className="text-3xl font-black text-gray-900 font-mono">{Math.floor(route.totalMin / 60)}</span>
              <span className="text-yellow-700 font-bold text-sm mr-1">시간</span>
              {route.totalMin % 60 > 0 && (
                <>
                  <span className="text-3xl font-black text-gray-900 font-mono">{route.totalMin % 60}</span>
                  <span className="text-yellow-700 font-bold text-sm">분</span>
                </>
              )}
            </>
          ) : (
            <>
              <span className="text-3xl font-black text-gray-900 font-mono">{route.totalMin}</span>
              <span className="text-yellow-700 font-bold text-sm">분</span>
            </>
          )}
        </div>
      </div>

      {/* ── 독립 스크롤 경로 영역 ── */}
      <div className="flex-1 overflow-y-auto px-8 pt-6 pb-6 custom-scrollbar-light bg-white">
        {route.steps.map((step: any, idx: number) => {
          const isWalk = step.type === "walk";
          const isLast = idx === route.steps.length - 1;
          
          let currentTheme = TRANSIT_THEMES[0];
          if (!isWalk) {
            currentTheme = TRANSIT_THEMES[transitColorIndex % TRANSIT_THEMES.length];
            transitColorIndex++;
          }

          return (
            <div key={idx} className="flex gap-6 mb-8 relative text-black">
              {!isLast && (
                <div className="absolute left-[27px] top-[60px] w-0.5 h-full bg-gray-200" />
              )}
              
              <div className={`w-14 h-14 rounded-full shrink-0 flex items-center justify-center z-10 border-2 shadow-sm
                ${isWalk ? "bg-gray-100 border-gray-300" : `${currentTheme.bg} ${currentTheme.border}`}`}>
                <span className="text-3xl">{isWalk ? "🚶" : "🚌"}</span>
              </div>
              
              <div className="flex-1 bg-gray-50 rounded-2xl p-5 border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-lg font-bold ${isWalk ? "text-black" : currentTheme.text}`}>
                    {isWalk ? step.description : `${step.busNumber} 탑승`}
                  </span>
                  <span className="text-black font-black font-mono text-xl">
                    {step.durationMin >= 60 
                      ? `${Math.floor(step.durationMin / 60)}시간 ${step.durationMin % 60 > 0 ? `${step.durationMin % 60}분` : ''}` 
                      : `${step.durationMin}분`}
                  </span>
                </div>
                {step.fromStop && (
                  <div className="mt-3 bg-white border border-gray-100 rounded-xl p-3 space-y-1.5 shadow-inner text-base text-black font-medium">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isWalk ? 'bg-gray-400' : currentTheme.bg}`} /> 
                      {step.fromStop} 승차
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500" /> 
                      {step.toStop} 하차
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* 최종 도착지 표시 */}
        <div className="flex gap-6 items-center pb-4">
          <div className="w-14 h-14 rounded-full bg-green-50 border-2 border-green-500 flex items-center justify-center text-2xl shadow-sm">🎯</div>
          <div className="flex-1 bg-green-50 border border-green-200 rounded-2xl p-4">
            <p className="text-xl font-black text-green-700">{destination} 도착</p>
          </div>
        </div>
      </div>
    </div>
  );
}