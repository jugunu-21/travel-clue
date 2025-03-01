import { useEffect, useState } from "react";
import { Smile, Frown, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResultFeedbackProps {
  isCorrect: boolean | null;
  fact: string;
  onNextQuestion: () => void;
  onPlayAgain: () => void;
  score: {
    correct: number;
    incorrect: number;
    total: number;
  };
}

const ResultFeedback = ({ isCorrect, fact, onNextQuestion, onPlayAgain, score }: ResultFeedbackProps) => {
  const [confetti, setConfetti] = useState<JSX.Element[]>([]);

  useEffect(() => {
    if (isCorrect === true) {
      // Generate confetti elements
      const newConfetti = [];
      for (let i = 0; i < 30; i++) {
        const left = Math.random() * 100;
        const size = Math.random() * 0.8 + 0.2;
        const delay = Math.random() * 0.5;
        const color = `hsl(${Math.random() * 360}, 70%, 50%)`;

        newConfetti.push(
          <div
            key={i}
            className="confetti animate-confetti"
            style={{
              left: `${left}%`,
              top: '-20px',
              width: `${10 * size}px`,
              height: `${10 * size}px`,
              backgroundColor: color,
              animationDelay: `${delay}s`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        );
      }
      setConfetti(newConfetti);
    } else {
      setConfetti([]);
    }
  }, [isCorrect]);

  if (isCorrect === null) {
    return null;
  }

  return (
    <div className="mt-6 animate-fade-in">
      {confetti}
      <div className="glass-card p-6 relative overflow-hidden">
        <div className="flex items-center mb-4">
          {isCorrect ? (
            <>
              <div className="bg-green-100 rounded-full p-2 mr-3">
                <Smile className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-green-600">Correct!</h3>
            </>
          ) : (
            <>
              <div className="bg-red-100 rounded-full p-2 mr-3">
                <Frown className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-red-600">Not quite right</h3>
            </>
          )}
        </div>

        <div className="bg-white/50 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-2">
            <div className="h-2 w-2 rounded-full bg-primary mr-2" />
            <h4 className="text-sm font-medium text-primary">FUN FACT</h4>
          </div>
          <p className="text-gray-800">{fact}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={onNextQuestion} className="flex-1">
            Next Question
          </Button>
          {score.total > 0 && (
            <Button
              onClick={onPlayAgain}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Play Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultFeedback;
