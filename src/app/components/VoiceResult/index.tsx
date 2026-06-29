// VoiceResult 결과 화면 메인 컨트롤러 (전체 레이아웃 정의)

import { MapPin, Mic, Home, Map, FileText } from "lucide-react"; // 💡 Map, FileText 아이콘 추가
import { BusList } from "./Buslist";
import { RouteDetailOverlay } from "./RouteDetail";
import { BusOption } from "../../../types/bus";
import { useEffect, useState, MutableRefObject } from "react";

export function VoiceResult({
    destination = "",         // 목적지
    buses = [],               // 검색된 버스 배열
    audioChunks,              // 녹음 데이터 청크
    onReset,                  // '다시 말하기' 클릭 시 실행할 함수
    onGoHome                  // '처음으로' 클릭 시 실행할 함수
}: {
    destination?: string;
    buses?: BusOption[];
    audioChunks: MutableRefObject<Blob[]>;
    onReset: () => void;
    onGoHome: () => void;
}) {
    // 텍스트 모드, 지도 모드 토글 상태창고
    const [viewMode, setViewMode] = useState<'text' | 'map'>('text');
    const [selectedBus, setSelectedBus] = useState<BusOption | null>(null);

    // buses 데이터가 새로 들어오면 자동으로 첫 번째 추천 버스를 기본 선택 상태로 세팅
    useEffect(() => {
        if (buses && buses.length > 0) {
            setSelectedBus(buses[0]);
        }
    }, [buses]);

    const handleBusClick = (bus: BusOption) => {
        setSelectedBus(bus);
    };
  
    return (
        <div className="w-full h-full flex flex-col font-['Noto_Sans_KR'] overflow-hidden" style={{ background: "#1A66CC" }}>
            {/* 상단 파란색 헤더: 목적지 정보와 컨트롤 버튼 */}
            <div className="h-14 flex items-center justify-between px-6 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-300" />
                    <span className="text-xl font-black text-white">{destination || "목적지"} 가는 버스</span>
                </div>
                
                {/* 컨트롤 버튼 그룹 */}
                <div className="flex gap-2">
                    {/* 지도로 보기 및 텍스트로 보기 토글 버튼 */}
                    <button 
                        onClick={() => setViewMode(prev => prev === 'text' ? 'map' : 'text')} 
                        className="flex flex-row items-center gap-1.5 px-4 py-1.5 bg-yellow-500/20 border border-yellow-300/30 rounded-lg text-yellow-100 font-bold text-sm hover:bg-yellow-500/30 transition-all shadow-sm"
                    >
                        {viewMode === 'text' ? (
                            <>
                                <Map className="w-4 h-4" /><span>지도로 보기</span>
                            </>
                        ) : (
                            <>
                                <FileText className="w-4 h-4" /><span>텍스트로 보기</span>
                            </>
                        )}
                    </button>

                    {/* 처음으로 버튼 */}
                    <button onClick={onGoHome} className="flex flex-row items-center gap-1 px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white font-bold text-sm hover:bg-white/20 transition-all">
                        <Home className="w-4 h-4" /><span>처음으로</span>
                    </button>
                    {/* 다시 말하기 버튼 */}
                    <button onClick={onReset} className="flex flex-row items-center gap-1 px-3 py-1.5 bg-blue-50/10 border border-blue-100/20 rounded-lg text-white font-bold text-sm hover:bg-blue-50/20 transition-all">
                        <Mic className="w-4 h-4" /><span>다시 말하기</span>
                    </button>
                </div>
            </div>

            {/* ── 메인 콘텐츠 영역 (좌우 분할 디자인 100% 유지) ── */}
            <div className="flex-1 flex overflow-hidden">
                {/* 왼쪽 30% 영역: 버스 번호 목록 */}
                <BusList buses={buses} selectedId={selectedBus?.id} onBusClick={handleBusClick} />
                
                {/* 오른쪽 70% 영역: 상세 경로 (흰색 배경) */}
                <div className="flex-1 bg-white relative">
                    {selectedBus && (selectedBus as any).routeDetail ? (
                        <RouteDetailOverlay 
                            route={(selectedBus as any).routeDetail} 
                            destination={destination} 
                            viewMode={viewMode} // 헤더 버튼 클릭 상태를 우측 컴포넌트에 실시간 주입
                            onClose={() => { }} 
                        />
                    ) : (
                        <div className="flex-1 h-full flex items-center justify-center">
                            <div className="text-gray-400 font-bold">경로 데이터를 구성 중입니다...</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}