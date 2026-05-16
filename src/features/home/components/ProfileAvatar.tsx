import React from 'react';
import { Image } from 'react-native';

import { AVATAR_IMAGES, DEFAULT_AVATAR_INDEX } from '../avatarImages';

interface Props {
  index: number;
  size?: number;
}

export function ProfileAvatar({ index, size = 48 }: Props) {
  const source = AVATAR_IMAGES[index] ?? AVATAR_IMAGES[DEFAULT_AVATAR_INDEX];
  return <Image source={source} style={{ width: size, height: size }} />;
}
