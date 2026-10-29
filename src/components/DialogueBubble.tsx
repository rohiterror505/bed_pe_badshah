import type { SpeechBubble } from '../types/game';

interface Props {
  bubbles: SpeechBubble[];
}

export function DialogueBubbleLayer({ bubbles }: Props) {
  return (
    <div className="absolute inset-0 pointer-events-none z-20" />
  );
}