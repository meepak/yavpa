import { Asset } from "expo-asset";
import { useEffect, useState } from "react";
import AnimatedSplash from "splash/animated-splash";

const AnimatedSplashAppLoader = ({
  children,
  image,
  bgColor,
  onAnimationComplete,
}: {
  children: React.ReactNode;
  image: any;
  bgColor: string;
  onAnimationComplete?: (arg0: boolean) => void;
}) => {
  const [isSplashReady, setSplashReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      await Asset.fromModule(image).downloadAsync();
      setSplashReady(true);
    }

    prepare();
  }, [image]);

  if (!isSplashReady) {
    return null;
  }

  return <AnimatedSplash bgColor={bgColor} image={image} onAnimationComplete={onAnimationComplete}>
    {children}
    </AnimatedSplash>;
};

export default AnimatedSplashAppLoader;
