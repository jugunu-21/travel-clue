import { Destination, UserScore, GameRoom } from '@/types';
import { websocketService } from './websocketService';
// This is a mock dataset that would normally be fetched from a backend
import { mockDestinations } from '@/data/destinations';

// This would normally be a database or backend service
const userScores: Record<string, UserScore> = {};
const gameRooms: Record<string, GameRoom> = {};

// Create a game service to handle all game logic
class GameService {
  async getDestinations(): Promise<Destination[]> {
    // In a real app, this would be a fetch request to your backend
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockDestinations);
      }, 500);
    });
  }

  async getRandomDestination(): Promise<Destination> {
    const destinations = await this.getDestinations();
    const randomIndex = Math.floor(Math.random() * destinations.length);
    return destinations[randomIndex];
  }

  async getRandomOptions(correctDestination: Destination, count: number = 4): Promise<Destination[]> {
    const destinations = await this.getDestinations();
    const filteredDestinations = destinations.filter(d => d.id !== correctDestination.id);

    // Shuffle the array
    const shuffled = [...filteredDestinations].sort(() => 0.5 - Math.random());

    // Take up to count-1 random destinations
    const randomOptions = shuffled.slice(0, count - 1);

    // Add the correct destination
    const options = [...randomOptions, correctDestination];

    // Shuffle again so the correct answer isn't always last
    return options.sort(() => 0.5 - Math.random());
  }

  async getRandomClue(destination: Destination): Promise<string> {
    const randomIndex = Math.floor(Math.random() * destination.clues.length);
    return destination.clues[randomIndex];
  }

  async getClueByIndex(destination: Destination, index: number): Promise<string> {
    // Make sure the index is within bounds
    if (index < 0 || index >= destination.clues.length) {
      return destination.clues[0];
    }
    return destination.clues[index];
  }

  async getRandomFact(destination: Destination): Promise<string> {
    const randomIndex = Math.floor(Math.random() * destination.facts.length);
    return destination.facts[randomIndex];
  }

  saveScore(username: string, isCorrect: boolean, roomId?: string): void {
    if (!userScores[username]) {
      userScores[username] = {
        username,
        score: {
          correct: 0,
          incorrect: 0,
          total: 0
        },
        timestamp: Date.now(),
        roomId
      };
    }

    const score = userScores[username].score;
    score.total += 1;

    if (isCorrect) {
      score.correct += 1;
    } else {
      score.incorrect += 1;
    }

    // Update timestamp
    userScores[username].timestamp = Date.now();

    // If user is in a room, update the score via WebSocket
    if (roomId) {
      userScores[username].roomId = roomId;
      websocketService.updateScore(userScores[username]);
    }
  }

  getScore(username: string): UserScore {
    return userScores[username] || {
      username,
      score: {
        correct: 0,
        incorrect: 0,
        total: 0
      }
    };
  }

  getAllScores(): UserScore[] {
    return Object.values(userScores)
      .sort((a, b) => {
        // First sort by percentage
        const aPercentage = a.score.total > 0 ? (a.score.correct / a.score.total) * 100 : 0;
        const bPercentage = b.score.total > 0 ? (b.score.correct / b.score.total) * 100 : 0;
        if (bPercentage !== aPercentage) {
          return bPercentage - aPercentage;
        }
        // If percentage is tied, prefer the one who answered more questions
        if (b.score.total !== a.score.total) {
          return b.score.total - a.score.total;
        }
        // If still tied, sort by most recent
        return (b.timestamp || 0) - (a.timestamp || 0);
      });
  }

  getRoomScores(roomId: string): UserScore[] {
    return Object.values(userScores)
      .filter(score => score.roomId === roomId)
      .sort((a, b) => {
        // First sort by percentage
        const aPercentage = a.score.total > 0 ? (a.score.correct / a.score.total) * 100 : 0;
        const bPercentage = b.score.total > 0 ? (b.score.correct / b.score.total) * 100 : 0;
        if (bPercentage !== aPercentage) {
          return bPercentage - aPercentage;
        }
        // If percentage is tied, prefer the one who answered more questions
        if (b.score.total !== a.score.total) {
          return b.score.total - a.score.total;
        }
        // If still tied, sort by most recent
        return (b.timestamp || 0) - (a.timestamp || 0);
      });
  }

  createRoom(username: string): string {
    const roomId = Math.random().toString(36).substring(2, 10);

    gameRooms[roomId] = {
      id: roomId,
      participants: [],
      createdBy: username,
      createdAt: Date.now()
    };

    return roomId;
  }

  getRoom(roomId: string): GameRoom | null {
    return gameRooms[roomId] || null;
  }

  joinRoom(username: string, roomId: string): boolean {
    const room = this.getRoom(roomId);

    if (!room) return false;

    // Check if user is already in the room
    const isInRoom = room.participants.some(p => p.username === username);

    if (!isInRoom) {
      const userScore = this.getScore(username);
      userScore.roomId = roomId;
      room.participants.push(userScore);

      // Update userScores record as well
      if (userScores[username]) {
        userScores[username].roomId = roomId;
      }
    }

    return true;
  }

  registerUser(username: string): void {
    if (!userScores[username]) {
      userScores[username] = {
        username,
        score: {
          correct: 0,
          incorrect: 0,
          total: 0
        },
        timestamp: Date.now()
      };
    }
  }

  generateShareUrl(username: string): string {
    // Create a new room for this challenge
    const roomId = this.createRoom(username);

    // Add the user to the room
    this.joinRoom(username, roomId);

    // In a real app, this would be a proper URL to your deployed app
    return `${window.location.origin}/game?inviter=${encodeURIComponent(username)}&roomId=${encodeURIComponent(roomId)}`;
  }
}

export const gameService = new GameService();
