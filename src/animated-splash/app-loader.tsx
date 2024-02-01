import { Asset } from "expo-asset";
import { useEffect, useState } from "react";
import AnimatedSplash from "@/animated-splash/splash";

const AnimatedSplashAppLoader = ({
  children,
  image,
  bgColor
}: {
  children: React.ReactNode;
  image: any;
  bgColor: string;
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

  return <AnimatedSplash bgColor={bgColor} image={image}>{children}</AnimatedSplash>;
};

export default AnimatedSplashAppLoader;
