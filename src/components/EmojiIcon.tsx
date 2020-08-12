import React from 'react';

export function EmojiIcon({ emoji, label }: { emoji: string; label: string }) {
  return (
    <span role="img" aria-label={`${label} icon`}>
      {emoji}
    </span>
  );
}
