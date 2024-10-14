import React, { useState } from 'react';
import MusicalStaff from './components/MusicalStaff';
import PitchDetector from './components/PitchDetector';
import { Music } from 'lucide-react';

function App() {
  const [notePosition, setNotePosition] = useState(7); // Default to C1 (middle of the range)

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <Music className="mr-2" /> Musical Staff (C1 to C2)
      </h1>
      <MusicalStaff notePosition={notePosition} />
      <PitchDetector onPitchDetected={setNotePosition} />
      <p className="mt-4 text-gray-600">Sing or play a note between C1 and C2 to see it on the staff!</p>
    </div>
  );
}

export default App;