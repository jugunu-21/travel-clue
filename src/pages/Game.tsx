import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import GameContainer from '@/components/GameContainer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { gameService } from '@/services/gameService';

const Game = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [inviterScoreData, setInviterScoreData] = useState(null);

    // Extract challenge parameters
    const inviterUsername = searchParams.get('inviter');
    const inviterScore = searchParams.get('score') ? parseInt(searchParams.get('score') || '0', 10) : null;
    const inviterTotal = searchParams.get('total') ? parseInt(searchParams.get('total') || '0', 10) : null;
    const roomId = searchParams.get('roomId');

    useEffect(() => {
        // Check if username is set in session storage
        const username = sessionStorage.getItem('globetrotter_username');

        // If not set and we're not coming from an invitation link, redirect to home
        if (!username && !inviterUsername) {
            navigate('/');
        }

        if (inviterUsername && inviterScore !== null) {
            setInviterScoreData({
                username: inviterUsername,
                score: {
                    correct: inviterScore,
                    incorrect: 0,
                    total: inviterTotal || inviterScore,
                },
                beaten: false
            });
        } else if (inviterUsername) {
            const inviterScoreFromService = gameService.getScore(inviterUsername);
            setInviterScoreData(inviterScoreFromService);
        }
    }, [navigate, inviterUsername, inviterScore, inviterTotal]);

    return (
        <div className="min-h-screen py-8 px-4 globe-bg">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6 flex justify-between items-center">
                    <Button
                        variant="ghost"
                        className="flex items-center space-x-2 hover:bg-white/20"
                        onClick={() => navigate('/')}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Home</span>
                    </Button>

                    <h1 className="text-2xl font-bold gradient-text">Globetrotter Challenge</h1>
                </div>

                <GameContainer inviterScore={inviterScore} inviterTotal={inviterTotal} />
            </div>
        </div>
    );
};

export default Game;
