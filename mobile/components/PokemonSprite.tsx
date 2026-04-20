import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Image } from "expo-image";

type Anim = "bob" | "faint" | "none";

interface Props {
  uri: string;
  size: number;
  animation?: Anim;
  hitTrigger?: number;
}

export function PokemonSprite({
  uri,
  size,
  animation = "bob",
  hitTrigger = 0,
}: Props) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    cancelAnimation(translateY);
    if (animation === "bob") {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-4, { duration: 1200 }),
          withTiming(0, { duration: 1200 }),
        ),
        -1,
        true,
      );
    } else if (animation === "faint") {
      opacity.value = withTiming(0.25, { duration: 600 });
      translateY.value = withTiming(20, { duration: 600 });
      rotate.value = withTiming(-12, { duration: 600 });
    } else {
      translateY.value = 0;
      opacity.value = 1;
      rotate.value = 0;
    }
  }, [animation, translateY, opacity, rotate]);

  useEffect(() => {
    if (hitTrigger === 0) return;
    translateX.value = withSequence(
      withTiming(-6, { duration: 90 }),
      withTiming(6, { duration: 90 }),
      withTiming(-4, { duration: 90 }),
      withTiming(4, { duration: 90 }),
      withTiming(0, { duration: 90 }),
    );
  }, [hitTrigger, translateX]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animStyle}>
      <View style={{ width: size, height: size }}>
        <Image
          source={{ uri }}
          style={{ width: size, height: size }}
          contentFit="contain"
        />
      </View>
    </Animated.View>
  );
}
