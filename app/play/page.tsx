'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import CharacterBubble from '../../components/CharacterBubble';
import SceneHeader from '../../components/SceneHeader';
import AnimatedChoice from '../../components/AnimatedChoice';
import VisualFeedback from '../../components/VisualFeedback';
import ProgressRing from '../../components/ProgressRing';
import BiasIndicator from '../../components/BiasIndicator';
import SecurityHeader from '../../components/SecurityHeader';
import SecurityCard from '../../components/SecurityCard';
import ThreatIndicator from '../../components/ThreatIndicator';
import { applyChoiceV2, tickTimer, GameState, EventItem } from '../../lib/engine-v2';
import { CharacterId, CHAR } from '../../lib/characters';
import { AudioManager, playSuccessSound, playErrorSound, playWarningSound, playClickSound, playTimerSound, playBadgeSound } from '../../lib/audio';
import { AchievementManager } from '../../lib/achievements';

interface Scenario {
  title: string;
  personas: { id: CharacterId }[];
  badges: { tier: string; xp: number }[];
  nodes: {
    id: string;
    actor: CharacterId;
    kind: string;
    text: string;
    timerSec?: number;
    evidence?: { id: string; label: string; text: string }[];
    choices?: {
      id: string;
      label: string;
      next: string;
      effects: {
        xp: number;
        bias: string[];
        feedback: string;
        severity: 'good'|'caution'|'bad';
      };
    }[];
  }[];
}

export default function PlayPage() {
  const router = useRouter();
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [persona, setPersona] = useState<CharacterId | null>(null);
  const [currentNode, setCurrentNode] = useState<any>(null);
  const [showEvidence, setShowEvidence] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; severity: 'good'|'caution'|'bad' } | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [achievementManager] = useState(() => new AchievementManager());
  const [newAchievements, setNewAchievements] = useState<any[]>([]);
  const [showAchievement, setShowAchievement] = useState(false);
  const [audioManager] = useState(() => AudioManager.getInstance());

  // Load scenario and restore state
  useEffect(() => {
    const loadScenario = async () => {
      try {
        const scenarioId = localStorage.getItem('kairo.scenario') || 'escalating-bec';
        console.log('Loading scenario:', scenarioId);
        const response = await fetch(`/scenarios/${scenarioId}.json`);
        const data = await response.json();
        console.log('Scenario loaded:', data);
        setScenario(data);
        
        // Initialize game state after scenario is loaded
        const personaId = localStorage.getItem('kairo.persona') as CharacterId;
        if (!personaId) {
          router.push('/');
          return;
        }
        setPersona(personaId);

        const savedState = localStorage.getItem('kairo.state');
        if (savedState) {
          console.log('Restoring saved state:', JSON.parse(savedState));
          setGameState(JSON.parse(savedState));
        } else {
          console.log('Initializing new game state');
          setGameState({
            nodeId: 'intro',
            xp: 0,
            bias: {},
            steps: 0,
            streak: 0,
            events: []
          });
        }
      } catch (error) {
        console.error('Failed to load scenario:', error);
        // Fallback micro-scenario
        setScenario({
          title: "Wire Transfer Mirage",
          personas: [{ id: 'acct' }, { id: 'pm' }],
          badges: [{ tier: "Bronze", xp: 10 }],
          nodes: [
            {
              id: "intro",
              actor: "impostor",
              kind: "narrative",
              text: "Urgent vendor payment requested: 14,900 EUR. The sender claims to be the CEO.",
              choices: [
                { id: "c1", label: "Investigate", next: "end", effects: { xp: 10, bias: [], feedback: "Good choice", severity: "good" } },
                { id: "c2", label: "Pay immediately", next: "end", effects: { xp: -5, bias: [], feedback: "Risky", severity: "bad" } }
              ]
            },
            { id: "end", actor: "system", kind: "end", text: "Scenario complete." }
          ]
        });
        
        const personaId = localStorage.getItem('kairo.persona') as CharacterId;
        if (!personaId) {
          router.push('/');
          return;
        }
        setPersona(personaId);
        setGameState({
          nodeId: 'intro',
          xp: 0,
          bias: {},
          steps: 0,
          streak: 0,
          events: []
        });
      }
    };

    loadScenario();
    
    // Initialize audio
    audioManager.initializeSounds();
  }, [router, audioManager]);

  // Update current node when scenario or game state changes
  useEffect(() => {
    if (scenario && gameState) {
      const node = scenario.nodes.find(n => n.id === gameState.nodeId);
      setCurrentNode(node);
      
      if (node?.timerSec) {
        setTimeLeft(node.timerSec);
        setStartTime(Date.now());
      }
    }
  }, [scenario, gameState]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && currentNode && startTime) {
      // Timer expired
      const elapsed = Date.now() - startTime;
      const penalty = tickTimer(currentNode, elapsed);
      if (penalty) {
        const newState = applyChoiceV2(gameState!, penalty, 'timer_expired');
        setGameState(newState);
        localStorage.setItem('kairo.state', JSON.stringify(newState));
        
        // Auto-advance to caution path if available
        const cautionChoice = currentNode.choices?.find((c: any) => c.effects.severity === 'caution');
        if (cautionChoice) {
          setTimeout(() => {
            handleChoice(cautionChoice);
          }, 1200);
        }
      }
    }
  }, [timeLeft, currentNode, startTime, gameState]);

  const handleChoice = useCallback((choice: any) => {
    if (!gameState || !scenario) {
      console.error('Missing gameState or scenario:', { gameState, scenario });
      return;
    }

    console.log('Choice selected:', choice);
    console.log('Current gameState:', gameState);
    console.log('Looking for next node:', choice.next);

    // Play sound effect
    playClickSound();
    
    const newState = applyChoiceV2(gameState, choice.effects, choice.id);
    console.log('New state after choice:', newState);
    
    // Play feedback sound
    if (choice.effects.severity === 'good') {
      playSuccessSound();
    } else if (choice.effects.severity === 'bad') {
      playErrorSound();
    } else {
      playWarningSound();
    }
    
    // Move to next node
    const nextNode = scenario.nodes.find(n => n.id === choice.next);
    console.log('Found next node:', nextNode);
    
    if (nextNode) {
      if (nextNode.kind === 'end') {
        console.log('Reached end node, going to debrief');
        // Check achievements
        const gameStats = {
          totalXP: newState.xp,
          scenariosCompleted: 1,
          currentStreak: newState.streak,
          biasAvoided: Object.values(newState.bias).reduce((sum, count) => sum + count, 0),
          perfectScores: newState.xp >= 40 ? 1 : 0
        };
        
        const unlockedAchievements = achievementManager.checkAchievements(gameStats);
        if (unlockedAchievements.length > 0) {
          setNewAchievements(unlockedAchievements);
          setShowAchievement(true);
          playBadgeSound();
        }
        
        // Game over - save result and go to debrief
        const result = {
          xp: newState.xp,
          bias: newState.bias,
          badges: scenario.badges,
          events: newState.events
        };
        localStorage.setItem('kairo.result', JSON.stringify(result));
        localStorage.removeItem('kairo.state');
        router.push('/debrief');
      } else {
        console.log('Moving to next node:', choice.next);
        // Update game state with new node ID
        const updatedState = { ...newState, nodeId: choice.next };
        console.log('Updated state:', updatedState);
        
        // Update state and node immediately
        setGameState(updatedState);
        setCurrentNode(nextNode);
        localStorage.setItem('kairo.state', JSON.stringify(updatedState));
        
        // Update timer
        if (nextNode.timerSec) {
          setTimeLeft(nextNode.timerSec);
          setStartTime(Date.now());
        } else {
          setTimeLeft(null);
        }
      }
    } else {
      console.error('Next node not found:', choice.next);
      console.log('Available nodes:', scenario.nodes.map(n => n.id));
    }

    // Show feedback
    setFeedback({
      text: choice.effects.feedback,
      severity: choice.effects.severity
    });

    // Clear feedback after 1.2s
    setTimeout(() => setFeedback(null), 1200);
  }, [gameState, scenario, router, achievementManager]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!currentNode?.choices) return;
      
      const key = e.key;
      if (key >= '1' && key <= '4') {
        const choiceIndex = parseInt(key) - 1;
        const choice = currentNode.choices[choiceIndex];
        if (choice) {
          handleChoice(choice);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentNode, handleChoice]);

  if (!scenario || !gameState || !persona || !currentNode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Simulation</h2>
          <p className="text-slate-300">Preparing cybersecurity training scenario...</p>
        </div>
      </div>
    );
  }

  // Count only interactive nodes (exclude end nodes)
  const interactiveNodes = scenario.nodes.filter(node => node.kind !== 'end');
  const progressPercent = (gameState.steps / interactiveNodes.length) * 100;
  const currentStep = gameState.steps + 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <SecurityHeader 
        title={scenario.title}
        subtitle={`Step ${currentStep} of ${interactiveNodes.length} • ${CHAR[persona].name}`}
        level={currentStep <= 2 ? 'medium' : currentStep <= 4 ? 'high' : 'critical'}
        progress={progressPercent}
      />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Timer */}
        {timeLeft !== null && (
          <div className="mb-6 text-center">
            <div className={`inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-lg ${
              timeLeft <= 5 
                ? 'bg-red-500 text-white shadow-lg shadow-red-200' 
                : timeLeft <= 15
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-200'
                : 'bg-blue-500 text-white shadow-lg shadow-blue-200'
            }`}>
              <span className="text-2xl">⏰</span>
              <span>Time remaining: {timeLeft}s</span>
            </div>
          </div>
        )}

        {/* Evidence drawer */}
        {currentNode.evidence && (
          <SecurityCard 
            title="Evidence Analysis" 
            icon="🔍" 
            variant="warning"
            className="mb-6"
          >
            <button
              onClick={() => setShowEvidence(!showEvidence)}
              className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg"
              aria-label="Toggle evidence drawer"
            >
              {showEvidence ? '🔽 Hide' : '🔍 Show'} Evidence ({currentNode.evidence.length})
            </button>
            
            {showEvidence && (
              <div className="mt-4 space-y-3">
                {currentNode.evidence.map((item: any) => (
                  <div key={item.id} className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-lg p-4 shadow-sm">
                    <div className="font-bold text-slate-900 mb-2 flex items-center space-x-2">
                      <span className="text-emerald-500">📋</span>
                      <span>{item.label}</span>
                    </div>
                    <div className="text-slate-700 text-sm font-mono bg-white rounded p-2 border">{item.text}</div>
                  </div>
                ))}
              </div>
            )}
          </SecurityCard>
        )}

        {/* Character bubble */}
        <div className="mb-8">
          <CharacterBubble actorId={currentNode.actor} delay={200}>
            <p className="whitespace-pre-wrap text-slate-800 leading-relaxed">{currentNode.text}</p>
          </CharacterBubble>
        </div>

        {/* Bias indicators */}
        {gameState && Object.keys(gameState.bias).length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(gameState.bias).map(([biasType, count]) => (
              <BiasIndicator
                key={biasType}
                biasType={biasType}
                count={count}
                isActive={count > 0}
              />
            ))}
          </div>
        )}

        {/* Choices */}
        {currentNode.choices && (
          <SecurityCard title="Decision Point" icon="⚡" variant="default" className="mt-8">
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Choose Your Response</h3>
                <p className="text-slate-600">Select the action you would take in this situation</p>
              </div>
              {currentNode.choices.map((choice: any, index: number) => (
                <AnimatedChoice
                  key={choice.id}
                  index={index}
                  onClick={() => handleChoice(choice)}
                  disabled={false}
                >
                  {choice.label}
                </AnimatedChoice>
              ))}
            </div>
          </SecurityCard>
        )}

        {/* Visual Feedback */}
        {feedback && (
          <VisualFeedback
            type={feedback.severity === 'good' ? 'success' : feedback.severity === 'bad' ? 'error' : 'warning'}
            message={feedback.text}
            duration={2000}
            onComplete={() => setFeedback(null)}
          />
        )}
      </div>

      {/* Achievement Modal */}
      {showAchievement && newAchievements.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Achievement Unlocked!
            </h2>
            {newAchievements.map((achievement, index) => (
              <div key={achievement.id} className="mb-4">
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  {achievement.name}
                </h3>
                <p className="text-slate-600 mb-2">
                  {achievement.description}
                </p>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  achievement.rarity === 'common' ? 'bg-slate-100 text-slate-800' :
                  achievement.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                  achievement.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {achievement.rarity.toUpperCase()}
                </span>
              </div>
            ))}
            <button
              onClick={() => {
                setShowAchievement(false);
                setNewAchievements([]);
              }}
              className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
