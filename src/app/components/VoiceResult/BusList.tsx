import { Clock } from "lucide-react";
import { BusOption } from "../../../types/bus";

export function BusList({ buses, selectedId, onBusClick }: {
    buses: BusOption[];
    selectedId?: string;
    onBusClick: (bus: BusOption) => void;
}) {
    return (
        // 전체 너비의 30%를 차지하며, 초과 시 스크롤 구현
        <div className="w-[30%] border-r border-white/10 overflow-y-auto custom-scrollbar bg-black/5">
            {buses.map((bus) => {
                // 현재 이 버스가 선택된 상태인지 확인
                const isSelected = selectedId === bus.id;
                return (
                    <button
                        key={bus.id}
                        onClick={() => onBusClick(bus)}
                        // 선택된 버스는 노란색 배경에 파란색 글자로 강조합니다.
                        className={`w-full flex flex-col items-center justify-center py-8 px-4 border-b border-white/5 transition-all ${isSelected ? "bg-yellow-400 text-blue-900" : "text-white"}`}>
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