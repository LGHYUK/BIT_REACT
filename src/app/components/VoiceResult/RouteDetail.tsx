import { MapPin } from "lucide-react";
import { RouteDetail } from "../../../types/bus";

interface RouteDetailOverlayProps {
  route: RouteDetail;
  destination: string;
  onClose: () => void;
}

export function RouteDetailOverlay({ route, destination }: RouteDetailOverlayProps) {
  return (
    <div
      className="absolute inset-0 z-[100] flex flex-col bg-gray-500 text-gray-900 animate-in fade-in slide-in-from-right-5 duration-300 overflow-hidden font-['Noto_Sans_KR']"
      style={{ width: "100%", height: "100%" }}
    >
      {/* ── 상단 헤더: 뒤로 가기 삭제 + 파란색 버스 번호 ── */}
      <div className="py-3 px-6 border-b border-gray-300 flex items-center justify-between bg-gray-50/80 shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-xl font-black text-gray-900 flex items-center">
            {/* ✅ 버스 번호 박스: 파란색 배경 (#2563EB) + 흰색 글자 */}
            <span className="bg-blue-600 text-white px-4 py-1.5 rounded-lg mr-3 font-mono text-2xl shadow-sm">
              {route.busNumber}번
            </span>
          </span>
        </div>

        {/* 소요 시간 박스: 노란색 강조 유지 */}
        <div className="bg-yellow-50 border border-yellow-200 px-5 py-1.5 rounded-xl flex items-baseline gap-2 shadow-sm">
          <span className="text-yellow-700 text-xs font-bold">소요 시간</span>
          <span className="text-3xl font-black text-gray-900 font-mono">{route.totalMin}</span>
          <span className="text-yellow-700 font-bold">분</span>
        </div>
      </div>

      {/* ── 경로 리스트: 단계별 안내 ── */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar-light bg-white">
        {route.steps.map((step: any, idx: number) => {
          const isWalk = step.type === "walk";
          const isLast = idx === route.steps.length - 1;
          return (
            <div key={idx} className="flex gap-6 mb-8 relative text-black">
                {/* 마지막 단계가 아니면 다음 아이콘까지 이어지는 수직선 */}
              {!isLast && (
                <div className={`absolute left-[27px] top-[60px] w-0.5 h-full bg-gray-200`} />
              )}
              {/* 단계별 아이콘 (걷기:🚶, 버스:🚌) */}
              <div className={`w-14 h-14 rounded-full shrink-0 flex items-center justify-center z-10 border-2 shadow-sm
                ${isWalk ? "bg-gray-100 border-gray-300" : "bg-blue-600 border-blue-400"}`}>
                <span className="text-3xl">{isWalk ? "🚶" : "🚌"}</span>
              </div>
              {/* 상세 설명 박스 */}
              <div className="flex-1 bg-gray-50 rounded-2xl p-5 border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-lg font-bold ${isWalk ? "text-black" : "text-blue-600"}`}>
                    {isWalk ? step.description : `${step.busNumber}번 탑승`}
                  </span>
                  <span className="text-black font-black font-mono text-xl">{step.durationMin}분</span>
                </div>
                {/* 버스 단계일 경우 승하차 정류장 정보를 추가 제공 */}
                {step.fromStop && (
                  <div className="mt-3 bg-white border border-gray-100 rounded-xl p-3 space-y-1.5 shadow-inner text-base text-black font-medium">
                    <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500" /> {step.fromStop} 승차</div>
                    <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500" /> {step.toStop} 하차</div>
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