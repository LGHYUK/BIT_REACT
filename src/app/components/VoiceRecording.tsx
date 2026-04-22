export function VoiceRecording({ transcript }: { transcript: string }) {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* 사용자가 다시 눌러야 함을 인지하도록 텍스트에 pulse 효과 */}
      <p className="text-sm text-white/60 animate-pulse">마이크 버튼을 다시 누르면 종료됩니다</p>
      {transcript && transcript !== "듣고 있습니다..." && (
        // 빨간색 테두리(border-red-500)로 '녹음 중'임을 강조
        <div className="bg-white/95 backdrop-blur border-4 border-red-500 py-3 px-8 rounded-2xl shadow-2xl animate-in zoom-in-95">
          <p className="text-lg text-gray-900 font-bold italic">"{transcript}"</p>
        </div>
      )}
    </div>
  );
}