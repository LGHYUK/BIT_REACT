// VoiceResult 결과 화면 메인 컨트롤러 (전체 레이아웃 정의)

import { MapPin, Mic, Home, Volume2 } from "lucide-react"; // Volume2 아이콘 추가
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
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    
    // 실시간 백엔드 데이터([/api/process])와 사용자의 클릭 이벤트를 원형 그대로 연결하는 로컬 상태창고를 개설합니다.
    const [selectedBus, setSelectedBus] = useState<BusOption | null>(null);

    // buses 데이터가 새로 들어오면 자동으로 첫 번째 추천 버스를 기본 선택 상태로 맞춥니다.
    useEffect(() => {
        if (buses && buses.length > 0) {
            setSelectedBus(buses[0]);
        }
    }, [buses]);

    // 컴포넌트가 마운트될 때 청크를 사용해 URL 생성
    useEffect(() => {
        if (audioChunks.current.length > 0) {
            const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
            const url = URL.createObjectURL(audioBlob);
            setAudioUrl(url);
            console.log("VoiceResult에서 생성된 Audio URL:", url);
        }
    }, [audioChunks]);
    
    // 내 목소리 재생 함수
    const playAudio = () => {
        if (audioUrl) {
            console.log("오디오 재생 시도:", audioUrl);
            const audio = new Audio(audioUrl);
            audio.play().catch(err => console.error("재생 실패:", err));
        } else {
            alert("재생할 오디오 데이터가 없습니다.");
        }
    };

    // 버스 카드 클릭 핸들러 로직 유지
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
                    {/* 내 목소리 확인 버튼 (오디오가 있을 때만 표시) */}
                    {audioUrl && (
                        <button 
                            onClick={playAudio} 
                            className="flex flex-row items-center gap-1 px-3 py-1.5 bg-yellow-500/20 border border-yellow-300/30 rounded-lg text-yellow-100 font-bold text-sm hover:bg-yellow-500/30 transition-all"
                        >
                            <Volume2 className="w-4 h-4" /><span>내 목소리 듣기</span>
                        </button>
                    )}
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

            {/* ── 메인 콘텐츠 영역 (좌우 분할 디자인 100% 원형 유지) ── */}
            <div className="flex-1 flex overflow-hidden">
                {/* 왼쪽 30% 영역: 버스 번호 목록 */}
                <BusList buses={buses} selectedId={selectedBus?.id} onBusClick={handleBusClick} />
                
                {/* 오른쪽 70% 영역: 상세 경로 (흰색 배경) */}
                <div className="flex-1 bg-white relative">
                    {/* 💡 [수정]: 하이재킹 훅을 배제하고 VoiceRecording에서 정밀 포맷팅을 마친 selectedBus 내부의 진짜 실시간 경로 데이터(routeDetail)를 다이렉트로 주입합니다. */}
                    {selectedBus && (selectedBus as any).routeDetail ? (
                        <RouteDetailOverlay 
                            route={(selectedBus as any).routeDetail} 
                            destination={destination} 
                            onClose={() => { }} 
                        />
                    ) : (
                        // 예외 케이스 및 초기 로딩 시 스피너 자동 방어선 구축 유지
                        <div className="flex-1 h-full flex items-center justify-center">
                            <div className="text-gray-400 font-bold">경로 데이터를 구성 중입니다...</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}