import { Clock } from "lucide-react";
import { BusOption } from "../../../types/bus";

export function BusList({ buses, selectedId, onBusClick }: {
    buses: BusOption[];
    selectedId?: string;
    onBusClick: (bus: BusOption) => void;
}) {
    return (
        // 전체 너비의 30%를 차지하며, 초과 시 스크롤 구현
        <div className="w-[30%] h-full border-r border-black overflow-y-auto custom-scrollbar bg-blue shrink-0">
            {buses.map((bus) => {
                // 현재 이 버스가 선택된 상태인지 확인
                const isSelected = selectedId === bus.id;
                return (
                    <button
                        key={bus.id}
                        onClick={() => onBusClick(bus)}
                        // 선택된 버스는 노란색 배경에 검은 글자, 미선택된 버스는 흰색 배경에 검은 글자
                        className={`w-full flex flex-col items-center justify-center py-8 px-4 border-b border-black transition-all ${
                            isSelected ? "bg-yellow-400 text-black" : "bg-white text-black"
                        }`} >
                        {/* 버스 번호 */}
                        <span className="text-5xl font-black font-mono mb-2">{bus.busNumber}</span>
                        <div className="flex items-center gap-1">
                            <Clock className="w-5 h-5" />
                            {/* 1분 이내면 "곧 도착", 아니면 남은 시간을 표시합니다. */}
                            <span className="text-2xl font-black font-mono">{bus.arrivalMin <= 1 ? "곧 도착" : `${bus.arrivalMin}분`}</span>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}