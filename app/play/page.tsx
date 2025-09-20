'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import CharacterBubble from '../../components/CharacterBubble';
import SceneHeader from '../../components/SceneHeader';
import AnimatedChoice from '../../components/AnimatedChoice';
import VisualFeedback from '../../components/VisualFeedback';
import ProgressRing from '../../components/ProgressRing';
import BiasIndicator from '../../components/BiasIndicator';
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
        const scenarioId = localStorage.getItem('kairo.scenario') || 'wire-transfer-mirage';
        const response = await fetch(`/scenarios/${scenarioId}.json`);
        const data = await response.json();
        setScenario(data);
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
      }
    };

    const personaId = localStorage.getItem('kairo.persona') as CharacterId;
    if (!personaId) {
      router.push('/');
      return;
    }
    setPersona(personaId);

    const savedState = localStorage.getItem('kairo.state');
    if (savedState) {
      setGameState(JSON.parse(savedState));
    } else {
      setGameState({
        nodeId: 'intro',
        xp: 0,
        bias: {},
        steps: 0,
        streak: 0,
        events: []
      });
    }

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
    if (!gameState || !scenario) return;

    // Play sound effect
    playClickSound();
    
    const newState = applyChoiceV2(gameState, choice.effects, choice.id);
    
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
    if (nextNode) {
      if (nextNode.kind === 'end') {
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
        // Update game state with new node ID
        const updatedState = { ...newState, nodeId: choice.next };
        setGameState(updatedState);
        localStorage.setItem('kairo.state', JSON.stringify(updatedState));
        
        // Update current node and timer
        setCurrentNode(nextNode);
        if (nextNode.timerSec) {
          setTimeLeft(nextNode.timerSec);
          setStartTime(Date.now());
        } else {
          setTimeLeft(null);
        }
      }
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading scenario...</p>
        </div>
      </div>
    );
  }

  // Count only interactive nodes (exclude end nodes)
  const interactiveNodes = scenario.nodes.filter(node => node.kind !== 'end');
  const progressPercent = (gameState.steps / interactiveNodes.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50">
      <SceneHeader
        title={scenario.title}
        personaId={persona}
        step={gameState.steps + 1}
        totalSteps={interactiveNodes.length}
        xp={gameState.xp}
        progressPercent={progressPercent}
      />

      <div className="max-w-4xl mx-auto p-4">
        {/* Timer */}
        {timeLeft !== null && (
          <div className="mb-4 text-center">
            <div className={`inline-block px-4 py-2 rounded-lg font-medium ${
              timeLeft <= 5 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
            }`}>
              Time remaining: {timeLeft}s
            </div>
          </div>
        )}

        {/* Evidence drawer */}
        {currentNode.evidence && (
          <div className="mb-6">
            <button
              onClick={() => setShowEvidence(!showEvidence)}
              className="w-full h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
              aria-label="Toggle evidence drawer"
            >
              {showEvidence ? 'Hide' : 'Show'} Evidence ({currentNode.evidence.length})
            </button>
            
            {showEvidence && (
              <div className="mt-4 space-y-3">
                {currentNode.evidence.map((item: any) => (
                  <div key={item.id} className="bg-white border border-slate-200 rounded-lg p-4">
                    <h4 className="font-medium text-slate-900 mb-2">{item.label}</h4>
                    <p className="text-sm text-slate-600">{item.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Character bubble */}
        <CharacterBubble actorId={currentNode.actor} delay={200}>
          <p className="whitespace-pre-wrap">{currentNode.text}</p>
        </CharacterBubble>

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
          <div className="mt-6 space-y-3">
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
