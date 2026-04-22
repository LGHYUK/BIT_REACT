// VoiceResult 결과 화면 메인 컨트롤러 (전체 레이아웃 정의)

import { MapPin, Mic, Loader2, Home } from "lucide-react"; // 아이콘 라이브러리
import { BusList } from "./Buslist";
import { RouteDetailOverlay } from "./RouteDetail";
import { useRouteSelection } from "../../../hooks/useRouteSelection";
import { BusOption } from "../../../types/bus";

export function VoiceResult({
    destination = "강남역",    // 목적지 (기본값 강남역)
    buses = [],               // 검색된 버스 배열
    onReset,                  // '다시 말하기' 클릭 시 실행할 함수
    onGoHome                  // '처음으로' 클릭 시 실행할 함수
}: {
    destination?: string;
    buses?: BusOption[];
    onReset: () => void;
    onGoHome: () => void;
}) {
    // useRouteSelection 훅을 통해 어떤 버스가 선택되었는지, 로딩 중인지 등의 상태를 가져옴.
    const { selectedBus, routeDetail, loading, handleBusClick } = useRouteSelection(destination, buses);

    return (
        <div className="w-full h-full flex flex-col font-['Noto_Sans_KR'] overflow-hidden" style={{ background: "#1A66CC" }}>
            {/* 상단 파란색 헤더: 목적지 정보와 컨트롤 버튼 */}
            <div className="h-14 flex items-center justify-between px-6 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-300" />
                    <span className="text-xl font-black text-white">{destination} 가는 버스</span>
                </div>
                {/* 처음으로, 다시말하기 버튼 */}
                <div className="flex gap-2">
                    <button onClick={onGoHome} className="flex flex-row items-center gap-1 px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white font-bold text-sm ">
                        <Home className="w-4 h-4" /><span>처음으로</span></button>
                    <button onClick={onReset} className="flex flex-row items-center gap-1 px-3 py-1.5 bg-blue-50/10 border border-blue-100/20 rounded-lg text-white font-bold text-sm">
                        <Mic className="w-4 h-4" /><span>다시 말하기</span></button>
                </div>
            </div>

            {/* ── 메인 콘텐츠 영역 (좌우 분할) ── */}
            <div className="flex-1 flex overflow-hidden">
                {/* 왼쪽 30% 영역: 버스 번호 목록 */}
                <BusList buses={buses} selectedId={selectedBus?.id} onBusClick={handleBusClick} />
                {/* 오른쪽 70% 영역: 상세 경로 (흰색 배경) */}
                <div className="flex-1 bg-white relative">
                    {loading ? (
                        // 데이터를 불러오는 중일 때 보여주는 스피너
                        <div className="flex-1 h-full flex items-center justify-center">
                            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                        </div>
                    ) : (
                        // 데이터 로딩이 끝나고 경로 정보(routeDetail)가 있을 때 상세 컴포넌트 렌더링
                        routeDetail && <RouteDetailOverlay route={routeDetail} destination={destination} onClose={() => { }} />
                    )}
                </div>
            </div>
        </div>
    );
}