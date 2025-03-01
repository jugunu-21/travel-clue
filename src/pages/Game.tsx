import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import GameContainer from '@/components/GameContainer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { gameService } from '@/services/gameService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const Game = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [inviterScoreData, setInviterScoreData] = useState(null);
    const [showUsernameDialog, setShowUsernameDialog] = useState(false);
    const [username, setUsername] = useState('');
    const [isUsernameSet, setIsUsernameSet] = useState(false);
    const { toast } = useToast();

    // Extract challenge parameters
    const inviterUsername = searchParams.get('inviter');
    const inviterScore = searchParams.get('score') ? parseInt(searchParams.get('score') || '0', 10) : null;
    const inviterTotal = searchParams.get('total') ? parseInt(searchParams.get('total') || '0', 10) : null;
    const roomId = searchParams.get('roomId');

    useEffect(() => {
        // Check if username is set in session storage
        const storedUsername = sessionStorage.getItem('globetrotter_username');

        if (storedUsername) {
            setIsUsernameSet(true);
            return;
        }

        // If coming from an invitation link and no username set, show username dialog
        if (!storedUsername && inviterUsername) {
            setShowUsernameDialog(true);
            return;
        }

        // If no username and not from invitation, redirect to home
        if (!storedUsername && !inviterUsername) {
            navigate('/');
            return;
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

    const handleUsernameSubmit = () => {
        if (!username.trim()) {
            toast({
                title: "Username required",
                description: "Please enter a username to continue",
                variant: "destructive",
            });
            return;
        }

        // Register the user
        gameService.registerUser(username);

        // Store the username in sessionStorage
        sessionStorage.setItem('globetrotter_username', username);

        // Update state to show game content
        setIsUsernameSet(true);

        // Close the dialog
        setShowUsernameDialog(false);
    };

    // Handle Enter key press
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleUsernameSubmit();
        }
    };

    if (!isUsernameSet) {
        return (
            <Dialog open={true} onOpenChange={() => { }}>
                <DialogContent className="glass-card" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Welcome to the Challenge!</DialogTitle>
                        <DialogDescription>
                            {inviterUsername} has challenged you! Enter your username to start playing.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <label htmlFor="username" className="text-sm font-medium text-gray-700">
                                Your Username
                            </label>
                            <Input
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Enter your username"
                                className="bg-white/80"
                                autoFocus
                            />
                        </div>
                        <Button
                            onClick={handleUsernameSubmit}
                            className="w-full"
                        >
                            Start Playing
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4 globe-bg">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            className="flex items-center space-x-2 hover:bg-white/20"
                            onClick={() => navigate('/')}
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to Home</span>
                        </Button>
                        <div className="glass-card px-4 py-2 rounded-lg flex items-center gap-2">
                            <p className="text-sm text-gray-600">Ready to explore,</p>
                            <span className="font-bold text-lg text-primary">{username || sessionStorage.getItem('globetrotter_username')}</span>
                            <span className="text-sm text-gray-600">!</span>
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold gradient-text">Globetrotter Challenge</h1>
                </div>

                <GameContainer
                    inviterScore={inviterScore}
                    inviterTotal={inviterTotal}
                    currentUsername={username || sessionStorage.getItem('globetrotter_username')}
                />
            </div>
        </div>
    );
};

export default Game;
