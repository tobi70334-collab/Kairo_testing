'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import CharacterBubble from '../../components/CharacterBubble';
import SceneHeader from '../../components/SceneHeader';
import { applyChoiceV2, tickTimer, GameState, EventItem } from '../../lib/engine-v2';
import { CharacterId, CHAR } from '../../lib/characters';

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
  }, [router]);

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

    const newState = applyChoiceV2(gameState, choice.effects, choice.id);
    
    // Move to next node
    const nextNode = scenario.nodes.find(n => n.id === choice.next);
    if (nextNode) {
      if (nextNode.kind === 'end') {
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
  }, [gameState, scenario, router]);

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
        <CharacterBubble actorId={currentNode.actor}>
          <p className="whitespace-pre-wrap">{currentNode.text}</p>
        </CharacterBubble>

        {/* Choices */}
        {currentNode.choices && (
          <div className="mt-6 space-y-3">
            {currentNode.choices.map((choice: any, index: number) => (
              <button
                key={choice.id}
                onClick={() => handleChoice(choice)}
                className="w-full h-12 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 font-medium rounded-xl transition-colors text-left px-4"
                aria-label={choice.label}
              >
                <span className="text-slate-500 mr-2">{index + 1}.</span>
                {choice.label}
              </button>
            ))}
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div className={`mt-4 p-3 rounded-lg text-center font-medium ${
            feedback.severity === 'good' ? 'bg-emerald-100 text-emerald-800' :
            feedback.severity === 'caution' ? 'bg-amber-100 text-amber-800' :
            'bg-rose-100 text-rose-800'
          }`}>
            {feedback.text}
          </div>
        )}
      </div>
    </div>
  );
}
