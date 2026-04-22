// VoiceResult 결과 창 UI 비즈니스 로직 구현

import { useState, useEffect } from "react";
import { BusOption, RouteDetail } from "../types/bus";

export function useRouteSelection(destination: string, buses: BusOption[]) {
  const [selectedBus, setSelectedBus] = useState<BusOption | null>(null);
  const [routeDetail, setRouteDetail] = useState<RouteDetail | null>(null);
  const [loading, setLoading] = useState(false);

  // 사용자가 버스 번호를 선택했을 때 해당 버스의 상세 경로 데이터 출력
  const handleBusClick = (bus: BusOption) => {
    setSelectedBus(bus);    // 선택된 버스 업데이트
    setLoading(true);       // 로딩 시작
    
    // API 시뮬레이션 (가짜 데이터를 통한 표시)
    setTimeout(() => {
      setRouteDetail({
        busNumber: bus.busNumber,
        totalMin: 25,
        steps: [
          { type: "walk", durationMin: 5, description: "정류장까지 걷기" },
          { type: "bus", durationMin: 15, busNumber: bus.busNumber, fromStop: "현재 정류장", toStop: `${destination} 정류장` },
          { type: "walk", durationMin: 5, description: "목적지까지 걷기" },
        ]
      });
      setLoading(false);
    }, 500);
  };

  // 컴포넌트가 처음 켜지거나 버스 목록이 바뀔 때 첫 번째 버스를 자동 선택
  useEffect(() => {
    if (buses.length > 0 && !selectedBus) handleBusClick(buses[0]);
  }, [buses]);

  return { selectedBus, routeDetail, loading, handleBusClick };
}