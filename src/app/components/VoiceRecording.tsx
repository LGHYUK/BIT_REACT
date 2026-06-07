import { useState, useRef, useCallback } from 'react';
import { BusOption } from '../../types/bus'; // 버스 타입 임포트 추가

/**
 * 1. 음성 녹음 로직을 담당하는 훅 (Hook)
 */
export function useVoiceRecorder() {
  // 상태 타입에 'result'를 추가하여 서버 파이프라인 응답 완료 상태를 대응합니다.
  const [status, setStatus] = useState<'idle' | 'listening' | 'loading' | 'result'>('idle');
  const [transcript, setTranscript] = useState("듣고 있습니다...");
  const [audioUrl, setAudioUrl] = useState<string | null>(null); // 녹음 파일 재생용 URL
  
  // 백엔드 파이프라인이 반환한 실제 데이터를 저장할 상태 추가
  const [destination, setDestination] = useState<string>("");
  const [buses, setBuses] = useState<BusOption[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null); // 8초 무응답 타이머
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null); // 1초 침묵 타이머
  const audioChunks = useRef<Blob[]>([]);
  
  // Hook 규칙 준수를 위해 컴포넌트 최상단에서 선언
  const hasDetectedSound = useRef(false);

  // 녹음된 데이터를 EC2 서버로 전송
  const uploadAudioToServer = async (blob: Blob) => {
    const formData = new FormData();
    formData.append("file", blob, "recording.webm");

    try {
      console.log("서버로 데이터 전송 시작...");
      // EC2 PUBLIC IP 전송
      const response = await fetch("http://52.14.242.174:8000/api/upload", { 
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) throw new Error("서버 응답 실패");
      const result = await response.json();
      console.log("서버 응답 성공:", result);

      // 백엔드 파이프라인이 분석해서 돌려준 실제 데이터를 상태에 저장합니다.
      if (result.destination) setDestination(result.destination);
      if (result.buses) setBuses(result.buses);

      // 데이터 매핑이 완료되면 결과 화면으로 전환합니다.
      setStatus('result');
    } catch (error) {
      console.error("서버 전송 실패:", error);
      alert("음성 인식 처리 중 오류가 발생했습니다.");
      setStatus('idle');
    }
  };

  // 녹음 종료 함수
  const stopRecording = useCallback((isTimeout = false) => {
    // 1. 모든 타이머 정리
    if (timerRef.current) clearTimeout(timerRef.current);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    // 2. 미디어 녹음 중단
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.requestData();
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    
    // 3. AudioContext 종료
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }

    if (isTimeout) {
      alert("음성이 감지되지 않았습니다. 처음부터 다시 시도해주세요.");
      setStatus('idle');
    } else {
      // 데이터가 비어있지 않은지 확인 후 URL 생성
      if (audioChunks.current.length > 0) {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url); 
        console.log("생성된 Audio URL:", url);

        // 녹음 종료 시 서버로 전송
        uploadAudioToServer(audioBlob);
      } else {
        console.warn("녹음된 데이터(chunks)가 없습니다.");
      }
      setStatus('loading');
      console.log("서버로 전달할 오디오 데이터:", audioChunks.current);
    }
  }, []);

  // 녹음 시작 함수
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunks.current = [];
      setAudioUrl(null); // 새로운 녹음 시작 시 이전 파일 초기화
      hasDetectedSound.current = false; // 소리 감지 플래그 초기화

      // 오디오 분석기 설정
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      const dataArray = new Uint8Array(analyser.fftSize);
      
      // 녹음 시작 (MIME 타입 명시적 지정)
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : 'audio/webm';
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunks.current.push(e.data);
          console.log("데이터 청크 수신됨, 현재 총 개수:", audioChunks.current.length);
        }
      };
      mediaRecorder.start();
      
      setStatus('listening');
      setTranscript("듣고 있습니다...");

      // A. 8초 무응답 타이머 (아무 말도 안 했을 경우 자동 종료)
      timerRef.current = setTimeout(() => stopRecording(true), 8000);

      // B. 실시간 음량 분석 (VAD)
      const checkVolume = () => {
        if (mediaRecorder.state === 'inactive') return;
        analyser.getByteFrequencyData(dataArray);
        const volume = dataArray.reduce((a, b) => a + b) / dataArray.length;
        console.log("현재 감지된 볼륨:", volume);

        if (volume > 5) { // 음성 감지 임계값 (5로 조정)
          hasDetectedSound.current = true;
          clearTimeout(timerRef.current!); // 8초 타이머 멈춤
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        } else {
          // 침묵 중일 때 1초 타이머 (1초 조용하면 종료)
          if (hasDetectedSound.current && !silenceTimerRef.current) {
            silenceTimerRef.current = setTimeout(() => stopRecording(false), 1000);
          }
        }
        requestAnimationFrame(checkVolume);
      };
      checkVolume();

    } catch (err: any) {
      console.error("녹음 시작 실패:", err);
      alert(`마이크 시작 실패: ${err.name} - ${err.message}`);
    }
  };

  return { status, transcript, audioUrl, audioChunks, destination, buses, startRecording, stopRecording };
}

/**
 * 2. 화면을 담당하는 컴포넌트 (Component)
 */
export function VoiceRecording({ transcript }: { transcript: string }) {
  return (
    <p className="text-4xl font-black text-white text-center drop-shadow-lg leading-tight animate-pulse">
      {transcript}
    </p>
  );
}