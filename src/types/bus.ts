//데이터 규격 정의 (실제 API 데이터가 아닌 임의로 만든 것, 바꿔야함.)

/* 공공 데이터 포털 API*/ 
export interface BusOption {
  id: string;           // 버스의 고유 식별자
  busNumber: string;    // 버스 번호
  direction: string;
  arrivalMin: number;
  currentStop: string;
}
/* 길찾기 정보 (오딧세이 API) */ 
export interface RouteStep {
  type: "walk" | "bus"; // 경로 단계의 종류 (도보 또는 버스)
  durationMin: number;  // 해당 단계에서 소요되는 시간
  description?: string; // 단계에 대한 설명 (예: '정류장까지 걷기')
  fromStop?: string;    // (버스일 경우) 승차 정류장
  toStop?: string;      // (버스일 경우) 하차 정류장
  busNumber?: string;   // (버스일 경우) 해당 버스 번호
}
/* 메인 버스 번호, 총 소요 시간 (VoiceResult에 띄워줄 내용)*/ 
export interface RouteDetail {
  busNumber: string;    // 안내 중인 메인 버스 번호
  totalMin: number;     // 목적지까지 총 소요 시간
  steps: RouteStep[];   // 경로를 구성하는 세부 단계들의 배열
}