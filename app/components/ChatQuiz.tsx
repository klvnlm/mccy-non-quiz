'use client';

import { useState, useEffect, useRef } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'bot' | 'user';
  content: string;
}

interface Choice {
  label: string;
  value: string;
}

type InputType = 'text' | 'choice' | 'multiselect';

interface QuizStep {
  id: string;
  botMessage: (profile: Record<string, string>) => string;
  inputType: InputType;
  choices?: Choice[];
  field: string;
  maxSelect?: number;                                          // multiselect cap
  columns?: 1 | 2 | 3;                                       // grid override
  condition?: (profile: Record<string, string>) => boolean;  // skip if false
}

// ── Quiz Data ──────────────────────────────────────────────────────────────

const STEPS: QuizStep[] = [
  // ── Profile ──────────────────────────────────────────────────────────────
  {
    id: 'name',
    botMessage: () =>
      "Hi there! I'm here to help you discover your career archetype and get personalised recommendations.\n\nLet's start — what's your name?",
    inputType: 'text',
    field: 'name',
  },
  {
    id: 'occupation',
    botMessage: (p) =>
      `Great to meet you, ${p.name || 'there'}! What's your current occupation status?`,
    inputType: 'choice',
    choices: [
      { label: '🎓  Student', value: 'student' },
      { label: '🪖  National Service', value: 'ns' },
      { label: '💼  Employed', value: 'employed' },
      { label: '🔍  Unemployed', value: 'unemployed' },
    ],
    field: 'occupation',
  },
  {
    id: 'education',
    botMessage: () => 'What level are you currently studying at?',
    inputType: 'choice',
    choices: [
      { label: 'Secondary school', value: 'secondary' },
      { label: 'ITE', value: 'ite' },
      { label: 'Polytechnic', value: 'poly' },
      { label: 'Junior College / Pre-university', value: 'jc' },
      { label: 'University', value: 'university' },
    ],
    field: 'education',
    condition: (p) => p.occupation === 'student',
  },

  // ── Preferences ───────────────────────────────────────────────────────────
  {
    id: 'job_priority',
    botMessage: () =>
      "Thanks for sharing that. Now let's talk about your preferences.\n\nWhen thinking about your first job, what feels most true for you?",
    inputType: 'choice',
    choices: [
      { label: '🔍  I want to explore and try different things first', value: 'explore' },
      { label: '⭐  I want a job that is well-regarded and respected', value: 'status' },
      { label: '💰  I want a job that pays well right from the start', value: 'pay' },
      { label: "🤔  I'm not sure yet", value: 'unsure' },
    ],
    field: 'job_priority',
  },
  {
    id: 'interests',
    botMessage: () =>
      "What areas would you be most interested in for your first job?\n\nPick up to 3.",
    inputType: 'multiselect',
    maxSelect: 3,
    columns: 3,
    choices: [
      { label: '🌳 Environment', value: 'environment' },
      { label: '🤝 Social cohesion', value: 'social' },
      { label: '🎨 Arts & heritage', value: 'arts' },
      { label: '🏃 Sports & wellbeing', value: 'sports' },
      { label: '💼 Business', value: 'business' },
      { label: '🧠 Mental health', value: 'mental_health' },
      { label: '🏠 Family', value: 'family' },
      { label: '🫶 Volunteering', value: 'volunteering' },
      { label: '🏫 Education', value: 'education' },
      { label: '💱 Finance', value: 'finance' },
      { label: '🌏 Global affairs', value: 'global' },
      { label: '🛡️ National security', value: 'security' },
      { label: '🏗️ Urban development', value: 'urban' },
      { label: '⚖️ Policy & law', value: 'policy' },
      { label: '🤖 Digital & tech', value: 'tech' },
    ],
    field: 'interests',
  },

  // ── Aptitude ──────────────────────────────────────────────────────────────
  {
    id: 'a1',
    botMessage: () =>
      "Great picks! Now let's find out your natural strengths.\n\nAnswer based on your default instincts — even when you're tired or stressed, is this still true about you?\n\n**\"I can easily explain complex ideas in a simple way that others instantly understand.\"**",
    inputType: 'choice',
    columns: 1,
    choices: [
      { label: 'Strongly agree', value: '5' },
      { label: 'Agree', value: '4' },
      { label: 'Somewhere in between', value: '3' },
      { label: 'Disagree', value: '2' },
      { label: 'Strongly disagree', value: '1' },
    ],
    field: 'a1',
  },
  {
    id: 'a2',
    botMessage: () =>
      '**"I enjoy working in groups and naturally help teams collaborate better."**',
    inputType: 'choice',
    columns: 1,
    choices: [
      { label: 'Strongly agree', value: '5' },
      { label: 'Agree', value: '4' },
      { label: 'Somewhere in between', value: '3' },
      { label: 'Disagree', value: '2' },
      { label: 'Strongly disagree', value: '1' },
    ],
    field: 'a2',
  },
  {
    id: 'a3',
    botMessage: () =>
      '**"When faced with a problem, I naturally come up with creative or unconventional solutions."**',
    inputType: 'choice',
    columns: 1,
    choices: [
      { label: 'Strongly agree', value: '5' },
      { label: 'Agree', value: '4' },
      { label: 'Somewhere in between', value: '3' },
      { label: 'Disagree', value: '2' },
      { label: 'Strongly disagree', value: '1' },
    ],
    field: 'a3',
  },
  {
    id: 'a4',
    botMessage: () => '**"I notice details and errors that others often miss."**',
    inputType: 'choice',
    columns: 1,
    choices: [
      { label: 'Strongly agree', value: '5' },
      { label: 'Agree', value: '4' },
      { label: 'Somewhere in between', value: '3' },
      { label: 'Disagree', value: '2' },
      { label: 'Strongly disagree', value: '1' },
    ],
    field: 'a4',
  },
  {
    id: 'a5',
    botMessage: () =>
      "Last one!\n\n**\"I naturally take charge and enjoy motivating others toward a shared goal.\"**",
    inputType: 'choice',
    columns: 1,
    choices: [
      { label: 'Strongly agree', value: '5' },
      { label: 'Agree', value: '4' },
      { label: 'Somewhere in between', value: '3' },
      { label: 'Disagree', value: '2' },
      { label: 'Strongly disagree', value: '1' },
    ],
    field: 'a5',
  },
];

// ── Archetype Result ───────────────────────────────────────────────────────

type ArchetypeKey = 'explorer' | 'achiever' | 'contributor' | 'innovator';

const ARCHETYPES: Record<ArchetypeKey, { title: string; tag: string; description: string }> = {
  explorer: {
    title: 'The Explorer',
    tag: 'Curious · Adaptable · Open-minded',
    description:
      "You're driven by discovery and variety. You thrive when given the freedom to try different paths, take on diverse challenges, and learn continuously. Roles that evolve over time and expose you to new experiences will keep you engaged and energised.",
  },
  achiever: {
    title: 'The Achiever',
    tag: 'Ambitious · Focused · Results-driven',
    description:
      "You're motivated by clear goals, recognition, and tangible outcomes. You work best in structured environments where effort is rewarded and progress is visible. Careers with defined advancement paths and high-impact work are your natural home.",
  },
  contributor: {
    title: 'The Contributor',
    tag: 'Empathetic · Collaborative · Purposeful',
    description:
      "You're energised by making a real difference in the lives of others. You thrive in people-centred environments where your work has a direct positive impact on communities. Roles in education, public service, healthcare, or social sectors will resonate deeply with you.",
  },
  innovator: {
    title: 'The Innovator',
    tag: 'Analytical · Creative · Forward-thinking',
    description:
      "You naturally gravitate toward complex problems and novel solutions. You're comfortable with ambiguity and excited by emerging fields. Careers at the intersection of technology, research, design, or policy will let you do your most meaningful thinking.",
  },
};

const INTEREST_MAP: Record<string, ArchetypeKey> = {
  environment: 'explorer', arts: 'explorer', sports: 'explorer', volunteering: 'explorer',
  business: 'achiever', finance: 'achiever', policy: 'achiever', security: 'achiever',
  social: 'contributor', mental_health: 'contributor', family: 'contributor', education: 'contributor',
  tech: 'innovator', urban: 'innovator', global: 'innovator',
};

function computeArchetype(profile: Record<string, string>): ArchetypeKey {
  const scores: Record<ArchetypeKey, number> = { explorer: 0, achiever: 0, contributor: 0, innovator: 0 };

  // Job priority
  if (profile.job_priority === 'explore' || profile.job_priority === 'unsure') scores.explorer += 3;
  else if (profile.job_priority === 'status' || profile.job_priority === 'pay') scores.achiever += 3;

  // Interest areas
  (profile.interests ?? '').split(',').forEach((v) => {
    const t = INTEREST_MAP[v.trim()];
    if (t) scores[t]++;
  });

  // Aptitude — map statements to archetypes
  const aptMap: [string, ArchetypeKey][] = [
    ['a1', 'innovator'],   // explain ideas clearly
    ['a2', 'contributor'], // team collaboration
    ['a3', 'explorer'],    // creative solutions
    ['a4', 'achiever'],    // attention to detail
    ['a5', 'achiever'],    // lead and motivate
  ];
  aptMap.forEach(([field, type]) => {
    const score = parseInt(profile[field] ?? '0');
    if (score >= 5) scores[type] += 2;
    else if (score >= 4) scores[type] += 1;
  });

  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0] as ArchetypeKey;
}

// ── Section / Progress ─────────────────────────────────────────────────────

const PREF_IDS = ['job_priority', 'interests'];
const APT_IDS = ['a1', 'a2', 'a3', 'a4', 'a5'];

function getSectionInfo(
  stepId: string,
  isComplete: boolean,
): { show: true; label: string; progress: number } | { show: false } {
  if (isComplete) return { show: true, label: 'Aptitude', progress: 100 };
  const prefIdx = PREF_IDS.indexOf(stepId);
  if (prefIdx >= 0)
    return { show: true, label: 'Preferences', progress: Math.round((prefIdx / (PREF_IDS.length + APT_IDS.length)) * 100) };
  const aptIdx = APT_IDS.indexOf(stepId);
  if (aptIdx >= 0)
    return {
      show: true,
      label: 'Aptitude',
      progress: Math.round(((PREF_IDS.length + aptIdx) / (PREF_IDS.length + APT_IDS.length)) * 100),
    };
  return { show: false };
}

// ── Render Helpers ─────────────────────────────────────────────────────────

function renderText(text: string) {
  return text.split('\n').map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*|_[^_]+_)/g);
    return (
      <span key={i} className={i > 0 ? 'mt-2 block' : ''}>
        {parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**'))
            return (
              <strong key={j} className="font-semibold text-zinc-900">
                {part.slice(2, -2)}
              </strong>
            );
          if (part.startsWith('_') && part.endsWith('_'))
            return (
              <span key={j} className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                {part.slice(1, -1)}
              </span>
            );
          return <span key={j}>{part}</span>;
        })}
      </span>
    );
  });
}

// ── Sub-components ─────────────────────────────────────────────────────────

function BotAvatar() {
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-900">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-3.5 w-3.5 text-white"
      >
        <path d="M10 1a6 6 0 0 0-3.815 10.631C7.237 12.5 8 13.443 8 14.456v.644a.75.75 0 0 0 .572.729 6.016 6.016 0 0 0 2.856 0A.75.75 0 0 0 12 15.1v-.644c0-1.013.762-1.957 1.815-2.825A6 6 0 0 0 10 1ZM8.863 17.414a.75.75 0 0 0-.226 1.483 9.066 9.066 0 0 0 2.726 0 .75.75 0 0 0-.226-1.483 7.553 7.553 0 0 1-2.274 0Z" />
      </svg>
    </div>
  );
}

function BotMessage({ content }: { content: string }) {
  return (
    <div className="animate-fade-in flex gap-4">
      <BotAvatar />
      <div className="flex-1 pt-0.5 text-sm leading-relaxed text-zinc-600">
        {renderText(content)}
      </div>
    </div>
  );
}

function UserMessage({ content }: { content: string }) {
  return (
    <div className="animate-fade-in flex justify-end">
      <div className="max-w-[80%] rounded-2xl bg-zinc-100 px-4 py-2.5 text-sm leading-relaxed text-zinc-800">
        {content}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-4">
      <BotAvatar />
      <div className="flex items-center gap-1.5 pt-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="inline-block h-2 w-2 animate-bounce rounded-full bg-zinc-300"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function ChatQuiz() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeChoices, setActiveChoices] = useState<Choice[] | null>(null);
  const [activeInputType, setActiveInputType] = useState<InputType | null>(null);
  const [activeColumns, setActiveColumns] = useState<1 | 2 | 3>(2);
  const [activeMaxSelect, setActiveMaxSelect] = useState(1);
  const [textInput, setTextInput] = useState('');
  const [multiSelected, setMultiSelected] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const profileRef = useRef<Record<string, string>>({});
  const initializedRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get next step index, skipping conditional steps that don't apply
  function getNextStep(fromIndex: number): number {
    let next = fromIndex + 1;
    while (next < STEPS.length) {
      const step = STEPS[next];
      if (!step.condition || step.condition(profileRef.current)) break;
      next++;
    }
    return next;
  }

  function showStep(stepIndex: number) {
    setIsTyping(true);
    setActiveChoices(null);
    setActiveInputType(null);
    setMultiSelected([]);

    if (stepIndex >= STEPS.length) {
      const archetype = computeArchetype(profileRef.current);
      const result = ARCHETYPES[archetype];
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: 'result',
            role: 'bot',
            content: `That wraps up the quiz! Here's your career archetype:\n\n**${result.title}**\n_${result.tag}_\n\n${result.description}`,
          },
        ]);
        setIsComplete(true);
      }, 1200);
      return;
    }

    const step = STEPS[stepIndex];
    const msg = step.botMessage(profileRef.current);
    setTimeout(
      () => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          { id: `bot-${step.id}`, role: 'bot', content: msg },
        ]);
        setActiveChoices(step.choices ?? null);
        setActiveInputType(step.inputType);
        setActiveColumns(step.columns ?? 2);
        setActiveMaxSelect(step.maxSelect ?? 1);
      },
      700 + Math.random() * 500,
    );
  }

  // Strict-Mode–safe init: only run once
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    showStep(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeInputType === 'text') inputRef.current?.focus();
  }, [activeInputType]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, activeChoices, multiSelected.length]);

  function advance(userContent: string) {
    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: 'user', content: userContent },
    ]);
    setActiveChoices(null);
    setActiveInputType(null);
    setMultiSelected([]);
    const next = getNextStep(currentStep);
    setCurrentStep(next);
    setTimeout(() => showStep(next), 400);
  }

  function handleTextSubmit() {
    const value = textInput.trim();
    if (!value) return;
    profileRef.current = { ...profileRef.current, [STEPS[currentStep].field]: value };
    setTextInput('');
    advance(value);
  }

  function handleChoiceSelect(choice: Choice) {
    const step = STEPS[currentStep];
    profileRef.current = { ...profileRef.current, [step.field]: choice.value };
    advance(choice.label);
  }

  function toggleMultiSelect(value: string) {
    setMultiSelected((prev) => {
      if (prev.includes(value)) return prev.filter((v) => v !== value);
      if (prev.length >= activeMaxSelect) return prev;
      return [...prev, value];
    });
  }

  function handleMultiselectConfirm() {
    if (multiSelected.length === 0) return;
    const step = STEPS[currentStep];
    const selectedLabels = step.choices!
      .filter((c) => multiSelected.includes(c.value))
      .map((c) => c.label)
      .join(', ');
    profileRef.current = { ...profileRef.current, [step.field]: multiSelected.join(',') };
    advance(selectedLabels);
  }

  function handleRetake() {
    profileRef.current = {};
    setMessages([]);
    setCurrentStep(0);
    setIsComplete(false);
    setActiveChoices(null);
    setActiveInputType(null);
    setTextInput('');
    setMultiSelected([]);
    setTimeout(() => showStep(0), 100);
  }

  const currentStepId = isComplete
    ? 'done'
    : currentStep < STEPS.length
      ? STEPS[currentStep].id
      : 'done';
  const section = getSectionInfo(currentStepId, isComplete);

  const gridClass =
    activeColumns === 3
      ? 'grid-cols-2 sm:grid-cols-3'
      : activeColumns === 1
        ? 'grid-cols-1'
        : 'grid-cols-1 sm:grid-cols-2';

  return (
    <div className="flex h-full flex-col bg-white">

      {/* Section progress bar */}
      {section.show && (
        <div className="shrink-0 border-b border-zinc-100 px-6 py-2">
          <div className="mx-auto flex max-w-2xl items-center gap-3">
            <span className="shrink-0 text-xs font-medium text-zinc-400">{section.label}</span>
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-zinc-100">
              <div
                className="h-full rounded-full bg-zinc-900 transition-all duration-500 ease-out"
                style={{ width: `${section.progress}%` }}
              />
            </div>
            <span className="shrink-0 w-8 text-right text-xs tabular-nums text-zinc-400">
              {section.progress}%
            </span>
          </div>
        </div>
      )}

      {/* Conversation */}
      <main
        className="flex-1 overflow-y-auto"
        role="log"
        aria-live="polite"
        aria-label="Quiz conversation"
      >
        <div className="mx-auto max-w-2xl space-y-6 px-6 py-8">

          {messages.map((msg) =>
            msg.role === 'bot' ? (
              <BotMessage key={msg.id} content={msg.content} />
            ) : (
              <UserMessage key={msg.id} content={msg.content} />
            ),
          )}

          {isTyping && <TypingIndicator />}

          {/* Choice / Likert buttons */}
          {activeChoices && activeInputType === 'choice' && !isTyping && (
            <div className={`animate-fade-in ml-11 grid gap-2 ${gridClass}`}>
              {activeChoices.map((choice) => (
                <button
                  key={choice.label}
                  onClick={() => handleChoiceSelect(choice)}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left text-sm text-zinc-600 transition-all hover:border-zinc-900 hover:bg-zinc-900 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
                >
                  {choice.label}
                </button>
              ))}
            </div>
          )}

          {/* Multi-select grid */}
          {activeChoices && activeInputType === 'multiselect' && !isTyping && (
            <div className="animate-fade-in ml-11 space-y-3">
              <div className={`grid gap-2 ${gridClass}`}>
                {activeChoices.map((choice) => {
                  const selected = multiSelected.includes(choice.value);
                  const atMax = multiSelected.length >= activeMaxSelect && !selected;
                  return (
                    <button
                      key={choice.value}
                      onClick={() => toggleMultiSelect(choice.value)}
                      disabled={atMax}
                      className={[
                        'rounded-xl border px-3 py-2.5 text-left text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900',
                        selected
                          ? 'border-zinc-900 bg-zinc-900 text-white'
                          : atMax
                            ? 'border-zinc-100 bg-zinc-50 text-zinc-300 cursor-not-allowed'
                            : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400',
                      ].join(' ')}
                    >
                      {choice.label}
                    </button>
                  );
                })}
              </div>
              {multiSelected.length > 0 && (
                <button
                  onClick={handleMultiselectConfirm}
                  className="animate-fade-in rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-80"
                >
                  Continue — {multiSelected.length} selected
                </button>
              )}
            </div>
          )}

          {/* Retake */}
          {isComplete && (
            <div className="animate-fade-in ml-11">
              <button
                onClick={handleRetake}
                className="rounded-full border border-zinc-200 px-5 py-2 text-sm text-zinc-500 transition-all hover:border-zinc-900 hover:text-zinc-900"
              >
                Retake quiz
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* Text input (Claude-style floating box) */}
      {activeInputType === 'text' && !isTyping && (
        <div className="shrink-0 border-t border-zinc-100 bg-white px-6 py-4">
          <div className="mx-auto max-w-2xl">
            <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm transition-shadow focus-within:shadow-md">
              <input
                ref={inputRef}
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
                placeholder="Type your answer…"
                aria-label="Your answer"
                className="flex-1 bg-transparent text-sm text-zinc-800 outline-none placeholder:text-zinc-400"
              />
              <button
                onClick={handleTextSubmit}
                disabled={!textInput.trim()}
                aria-label="Send"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white transition-opacity hover:opacity-80 disabled:opacity-25"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-3.5 w-3.5"
                >
                  <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.154.75.75 0 0 0 0-1.115A28.897 28.897 0 0 0 3.105 2.288Z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
