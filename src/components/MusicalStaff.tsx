import React from 'react';

interface MusicalStaffProps {
  notePosition: number;
}

const MusicalStaff: React.FC<MusicalStaffProps> = ({ notePosition }) => {
  const staffLines = [0, 1, 2, 3, 4].map(i => (
    <line key={i} x1="0" y1={20 + i * 10} x2="100" y2={20 + i * 10} stroke="black" />
  ));

  const ledgerLines = [
    { y: 10, show: notePosition <= 1 },
    { y: 60, show: notePosition >= 11 }
  ].map((line, i) => (
    line.show && <line key={i} x1="35" y1={line.y} x2="65" y2={line.y} stroke="black" />
  ));

  const noteNames = ['C1', 'C#1', 'D1', 'D#1', 'E1', 'F1', 'F#1', 'G1', 'G#1', 'A1', 'A#1', 'B1', 'C2'];

  return (
    <div className="w-full max-w-md mx-auto">
      <svg viewBox="0 0 100 70" className="w-full">
        {staffLines}
        {ledgerLines}
        <ellipse cx="50" cy={60 - notePosition * 2.5} rx="5" ry="4" fill="black" />
      </svg>
      <p className="text-center mt-2 font-semibold">
        {noteNames[notePosition] || ''}
      </p>
    </div>
  );
};

export default MusicalStaff;