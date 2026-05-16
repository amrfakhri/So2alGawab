import React from 'react';

import { Subcategory } from '../../game/types/game';
import { CategorySelectCard, getCategoryBlobColor, getCategoryEmoji } from './CategorySelectionUI';

interface SubcategoryCardProps {
  subcategory: Subcategory;
  remainingGames: number;
  selected: boolean;
  onPress: () => void;
}

export function SubcategoryCard({
  subcategory,
  remainingGames,
  selected,
  onPress,
}: SubcategoryCardProps) {
  return (
    <CategorySelectCard
      title={subcategory.name}
      questionCount={remainingGames}
      imageUrl={subcategory.image}
      blobColor={getCategoryBlobColor(subcategory.id)}
      emoji={getCategoryEmoji(subcategory.name)}
      selected={selected}
      onPress={onPress}
    />
  );
}
