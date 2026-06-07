import type { BusOption, BusCongetion } from "../types/bus";

const EC2_SERVER_URL = "http://52.14.242.174:8000";

interface StationItem {
  busRouteId: string; rtNm: string;
  vehId1: string;  traTime1: string;  busType1: string;
  isLast1: string; isFullFlag1: string; congestion1: string;
  arrmsg1: string; stationNm1: string;
  vehId2: string;  traTime2: string;  busType2: string;
  isLast2: string; isFullFlag2: string; congestion2: string;
  arrmsg2: string; stationNm2: string;
}

interface ApiHeader { headerCd: string; headerMsg: string; }
interface ApiBody   { itemList?: StationItem | StationItem[]; }
interface ApiResponse { comMsgHeader: object; msgHeader: ApiHeader; msgBody: ApiBody; }

const ERROR_MESSAGES: Record<string, string> = {
  "1": "시스템 오류가 발생했습니다.", "2": "잘못된 요청입니다.",
  "3": "정류소를 찾을 수 없습니다.", "4": "노선을 찾을 수 없습니다.",
  "6": "실시간 정보를 읽을 수 없습니다.", "7": "인증키 오류입니다.",
  "8": "운행이 종료되었습니다.",
};

function toCongestion(val: string): BusCongetion {
  const n = parseInt(val, 10);
  if (n === 4) return 4;
  if (n === 5) return 5;
  return 3;
}

function parseRemainingStops(arrmsg: string): number {
  if (arrmsg.includes("곧 도착")) return 0;
  const match = arrmsg.match(/\[(\d+)번째 전\]/);
  return match ? parseInt(match[1], 10) : -1;
}

export async function getArrivalsByStation(arsId: string): Promise<BusOption[]> {

  const url = `${EC2_SERVER_URL}/api/station/getStationByUid?arsId=${arsId}&resultType=json`;

  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`HTTP 오류: ${res.status}`);

  const data: ApiResponse = await res.json();
  const header = data?.msgHeader;
  if (!header) throw new Error("API 응답 형식이 올바르지 않습니다.");
  if (header.headerCd !== "0") throw new Error(ERROR_MESSAGES[header.headerCd] ?? header.headerMsg);

  const raw = data?.msgBody?.itemList;
  if (!raw) return [];

  const items: StationItem[] = Array.isArray(raw) ? raw : [raw];
  const result: BusOption[] = [];

  items.forEach((item) => {
    const t1 = parseInt(item.traTime1);
    const t2 = parseInt(item.traTime2);

    if (item.vehId1 !== "0" && t1 > 0) {
      result.push({
        id: `${item.busRouteId}-1`,
        busNumber: item.rtNm,
        arrivalMin: Math.ceil(t1 / 60),
        traTimeSec: t1,
        arrivalMsg: item.arrmsg1,
        currentStationName: item.stationNm1?.trim() || "",
        remainingStops: parseRemainingStops(item.arrmsg1),
        busType: parseInt(item.busType1),
        congetion: toCongestion(item.congestion1),
        isFullFlag: item.isFullFlag1 === "1",
        isLastBus: item.isLast1 === "1",
        plainNo: "", isSecond: false,
      });
    }
    if (item.vehId2 !== "0" && t2 > 0) {
      result.push({
        id: `${item.busRouteId}-2`,
        busNumber: item.rtNm,
        arrivalMin: Math.ceil(t2 / 60),
        traTimeSec: t2,
        arrivalMsg: item.arrmsg2,
        currentStationName: item.stationNm2?.trim() || "",
        remainingStops: parseRemainingStops(item.arrmsg2),
        busType: parseInt(item.busType2),
        congetion: toCongestion(item.congestion2),
        isFullFlag: item.isFullFlag2 === "1",
        isLastBus: item.isLast2 === "1",
        plainNo: "", isSecond: true,
      });
    }
  });

  return result.sort((a, b) => a.traTimeSec - b.traTimeSec);
}

export function getCongestionLabel(c: BusCongetion): string {
  return ({ 3: "여유", 4: "보통", 5: "혼잡" } as Record<number, string>)[c] ?? "여유";
}

export function getCongestionColor(c: BusCongetion): string {
  return ({
    3: "text-[#065F46] bg-[#D1FAE5] border-[#34D399]",
    4: "text-[#92400E] bg-[#FEF3C7] border-[#F59E0B]",
    5: "text-[#991B1B] bg-[#FEE2E2] border-[#F87171]",
  } as Record<number, string>)[c] ?? "text-[#065F46] bg-[#D1FAE5] border-[#34D399]";
}