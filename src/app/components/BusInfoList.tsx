import { useState, useEffect } from "react";
import { BusOption as BusInfo } from "../../types/bus";

/* ────────────────────────────────────────────
   데이터 타입 & 목 데이터
──────────────────────────────────────────── */
const mockBusData: BusInfo[] = [
  { id: "1",  busNumber: "101",    direction: "강남역방면",       arrivalMin: 1,  currentStop: "시청앞" },
  { id: "2",  busNumber: "152",    direction: "서울역방면",       arrivalMin: 2,  currentStop: "역삼역" },
  { id: "3",  busNumber: "740",    direction: "수서역방면",       arrivalMin: 5,  currentStop: "강남역" },
  { id: "4",  busNumber: "301",    direction: "선릉역방면",       arrivalMin: 6,  currentStop: "선릉역" },
  { id: "5",  busNumber: "146",    direction: "삼성역방면",       arrivalMin: 7,  currentStop: "삼성역" },
  { id: "6",  busNumber: "360",    direction: "역삼역방면",       arrivalMin: 8,  currentStop: "역삼역" },
];

const SOON_THRESHOLD = 3;   
const SOON_PER_PAGE  = 5;
const MAIN_PER_PAGE  = 5;
const DAY_KR = ["일", "월", "화", "수", "목", "금", "토"];

/** * 실시간 시계 관리 훅
 */
function useLiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

/** * '잠시 후 도착' 개별 카드 UI
 */
function SoonCard({ bus }: { bus: BusInfo }) {
  return (
    <div className="flex-1 min-w-0 min-h-[80px] bg-[#333333] rounded-xl flex flex-col items-center justify-center py-2 px-1 shadow-2xl border-2 border-[#444]">
      {/* 상태 표시줄 (여유) */}
      <div className="bg-white rounded-full px-4 py-1 text-[13px] font-black text-[#059669] mb-2 shadow-inner">여유</div>
      {/* 버스 번호 */}
      <div className="text-[48px] font-black text-[#FACC15] tracking-[-2px] font-mono leading-none">{bus.busNumber}</div>
    </div>
  );
}

export function BusInfoList() {
  const [mainPage, setMainPage] = useState(0);
  const [soonPage, setSoonPage] = useState(0);
  const now = useLiveClock();

  // 데이터 필터링 및 페이지 계산
  const arrivingSoon = mockBusData.filter((b) => b.arrivalMin <= SOON_THRESHOLD);
  const soonTotalPages = Math.ceil(arrivingSoon.length / SOON_PER_PAGE);
  const mainTotalPages = Math.ceil(mockBusData.length / MAIN_PER_PAGE);

  // 5초마다 자동 페이지 전환
  useEffect(() => {
    if (soonTotalPages <= 1) return;
    const id = setInterval(() => setSoonPage((p) => (p + 1) % soonTotalPages), 5000);
    return () => clearInterval(id);
  }, [soonTotalPages]);

  useEffect(() => {
    if (mainTotalPages <= 1) return;
    const id = setInterval(() => setMainPage((p) => (p + 1) % mainTotalPages), 5000);
    return () => clearInterval(id);
  }, [mainTotalPages]);

  // 현재 페이지 데이터 슬라이싱
  const currentSoonPage = Math.min(soonPage, Math.max(0, soonTotalPages - 1));
  const currentMainPage = Math.min(mainPage, Math.max(0, mainTotalPages - 1));
  const currentSoon = arrivingSoon.slice(currentSoonPage * SOON_PER_PAGE, (currentSoonPage + 1) * SOON_PER_PAGE);
  const currentMain = mockBusData.slice(currentMainPage * MAIN_PER_PAGE, (currentMainPage + 1) * MAIN_PER_PAGE);

  // 시간 포맷팅 변수
  const yy = now.getFullYear();
  const mm = now.getMonth() + 1;
  const dd = now.getDate();
  const day = DAY_KR[now.getDay()];
  const hh24 = now.getHours();
  const ampm = hh24 >= 12 ? "오후" : "오전";
  const displayH = hh24 > 12 ? hh24 - 12 : hh24 === 0 ? 12 : hh24;
  const displayM = String(now.getMinutes()).padStart(2, "0");
  const displayS = String(now.getSeconds()).padStart(2, "0");

  return (
    <div className="w-full h-full flex flex-col bg-[#E5E7EB] overflow-hidden font-['Noto_Sans_KR']">
      {/* 1. 헤더 영역 */}
      <div className="bg-[#1C1F26] border-b-4 border-[#374151] px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex flex-col text-left">
          <span className="text-[14px] text-blue-400 font-bold mb-0.5">서울특별시</span>
          <span className="text-[32px] font-black text-white leading-tight">강남역 1번 정류장</span>
        </div>
        <div className="text-right text-white">
          <div className="text-[14px] text-gray-400 mb-1">{yy}년 {mm}월 {dd}일 ({day})</div>
          <div className="text-[42px] font-black font-mono leading-none flex items-baseline gap-2">
            <span className="text-[24px] text-yellow-400">{ampm}</span>
            {displayH}:{displayM}:{displayS}
          </div>
        </div>
      </div>

      {/* 2. 잠시 후 도착 섹션 */}
      <div className="bg-gradient-to-b from-[#FDE047] to-[#F59E0B] border-b-4 border-[#D97706] pt-3 px-5 pb-4 shrink-0">
        <div className="flex justify-between items-end mb-3">
          <div className="flex flex-col text-left">
            <span className="text-[22px] font-black text-[#78350F] tracking-[-0.5px] leading-tight">잠시 후 도착</span>
            <span className="text-[14px] font-bold text-[#92400E]">Arrival Soon</span>
          </div>
        </div>

        {arrivingSoon.length === 0 ? (
          <div className="text-center text-[#78350F] font-bold text-[18px] py-6 bg-[#333333]/10 rounded-md">도착 예정인 버스가 없습니다</div>
        ) : (
          <div className="flex gap-2 w-full items-stretch">
            {currentSoon.map((bus) => <SoonCard key={bus.id} bus={bus} />)}
            {Array.from({ length: SOON_PER_PAGE - currentSoon.length }).map((_, i) => (
              <div key={`empty-soon-${i}`} className="flex-1 min-h-[110px] bg-[#333333] opacity-70 rounded-xl border-2 border-[#444]" />
            ))}
          </div>
        )}
      </div>

      {/* 3. 메인 목록 영역 */}
      <div className="flex-1 flex flex-col min-h-0 bg-white">
        {/* 테이블 헤더 */}
        <div className="bg-[#475569] border-b border-[#334155] grid grid-cols-[160px_140px_1fr] shrink-0 shadow-md z-10">
          {["노선번호", "도착 예정", "버스 현재 위치"].map((label, i) => (
            <div key={i} className={`py-[12px] px-4 text-[16px] font-black text-white tracking-[1px] ${i === 2 ? "text-left" : "text-center"} ${i < 2 ? "border-r border-[#64748B]" : ""}`}>{label}</div>
          ))}
        </div>

        {/* 버스 목록 본문 */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#F1F5F9]">
          <div className="flex flex-col h-full">
            {currentMain.map((bus, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div key={bus.id} className={`flex-1 grid grid-cols-[160px_140px_1fr] border-b border-[#CBD5E1] items-center min-h-0 ${isEven ? "bg-white" : "bg-[#F8FAFC]"}`}>
                  <div className="flex items-center justify-center px-4 border-r border-[#CBD5E1] h-full font-black text-[32px] text-[#1E293B] tracking-[-1px]">{bus.busNumber}</div>
                  <div className="flex items-center justify-center px-2 border-r border-[#CBD5E1] h-full gap-1.5">
                    <div className="w-[52px] h-[52px] rounded-full border-[4px] border-[#FACC15] flex items-center justify-center bg-white shadow-sm">
                      <span className="text-[28px] font-black text-[#1E293B] font-mono leading-none mt-1">{bus.arrivalMin}</span>
                    </div>
                    <span className="text-[18px] font-bold text-[#475569] mb-1">분</span>
                  </div>
                  <div className="flex items-center px-5 h-full gap-3 text-left">
                    <div className="bg-[#D1FAE5] border border-[#34D399] rounded flex flex-col items-center px-1.5 py-0.5 shadow-sm shrink-0">
                      <span className="text-[11px] font-black text-[#065F46] leading-tight">여</span>
                      <span className="text-[11px] font-black text-[#065F46] leading-tight">유</span>
                    </div>
                    <span className="text-[24px] font-bold text-[#1E293B] tracking-[-0.5px] truncate">{bus.currentStop}</span>
                  </div>
                </div>
              );
            })}
            {Array.from({ length: MAIN_PER_PAGE - currentMain.length }).map((_, i) => (
              <div key={`empty-main-${i}`} className={`flex-1 grid grid-cols-[160px_140px_1fr] border-b border-[#CBD5E1] min-h-0 ${(currentMain.length + i) % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]"}`} />
            ))}
          </div>
        </div>

        {/* 푸터 영역 (페이지 인디케이터) */}
        <div className="bg-[#E2E8F0] border-t border-[#CBD5E1] flex items-center justify-between py-2 px-5 shrink-0">
          <span className="text-[13px] text-[#64748B] font-bold">도착 정보는 실시간으로 변경될 수 있습니다</span>
          <div className="flex gap-1.5 items-center">
            {Array.from({ length: mainTotalPages }).map((_, i) => (
              <div key={i} className={`h-2.5 rounded-full transition-all duration-300 ${i === currentMainPage ? "w-8 bg-[#475569]" : "w-2.5 bg-[#94A3B8]"}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}