import { CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';

interface Props {
  correctCount: number;
  againCount: number;
  onStudyMore: () => void;
}

export function SessionComplete({ correctCount, againCount, onStudyMore }: Props) {
  const navigate = useNavigate();
  const total = correctCount + againCount;
  const accuracy = total === 0 ? 0 : Math.round((correctCount / total) * 100);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <CheckCircle className="text-green-500 mb-4" size={64} />
      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-2">Session Complete!</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Great work — keep it up!</p>

      <div className="flex gap-8 mb-8">
        <div className="text-center">
          <p className="text-3xl font-bold text-green-500">{correctCount}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Correct</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-red-500">{againCount}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Again</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-indigo-500">{accuracy}%</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Accuracy</p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => navigate('/')}>Back to Home</Button>
        <Button onClick={onStudyMore}>Study More</Button>
      </div>
    </div>
  );
}
