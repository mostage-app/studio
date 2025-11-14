export interface PresentationConfig {
  theme: "light" | "dark" | "dracula" | "ocean" | "rainbow";
  scale: number;
  loop: boolean;
  keyboard: boolean;
  touch: boolean;
  urlHash: boolean;
  transition: {
    type: "horizontal" | "vertical" | "fade" | "slide";
    duration: number;
    easing: string;
  };
  centerContent: {
    vertical: boolean;
    horizontal: boolean;
  };
  header: {
    enabled: boolean;
    content?: string;
    contentPath?: string;
    position?: "top-left" | "top-center" | "top-right";
    showOnFirstSlide?: boolean;
  };
  footer: {
    enabled: boolean;
    content?: string;
    contentPath?: string;
    position?: "bottom-left" | "bottom-center" | "bottom-right";
    showOnFirstSlide?: boolean;
  };
  plugins: {
    ProgressBar: {
      enabled: boolean;
      position: "top" | "bottom";
      height?: string;
      color?: string;
      backgroundColor?: string;
    };
    SlideNumber: {
      enabled: boolean;
      position: "bottom-right" | "bottom-left" | "bottom-center";
      format?: string;
      color?: string;
      fontSize?: string;
    };
    Controller: {
      enabled: boolean;
      position: "bottom-right" | "bottom-left" | "bottom-center";
      showLabels?: boolean;
      theme?: "light" | "dark";
    };
    Confetti: {
      enabled: boolean;
      particleCount?: number;
      size?: { min: number; max: number };
      duration?: number;
      delay?: number;
      colors?: string[];
    };
  };
  background?: Array<{
    imagePath: string;
    size: "contain" | "cover" | "auto" | string;
    position:
      | "top-left"
      | "top-center"
      | "top-right"
      | "center"
      | "bottom-left"
      | "bottom-center"
      | "bottom-right"
      | "left"
      | "right";
    repeat: "no-repeat" | "repeat" | "repeat-x" | "repeat-y";
    bgColor: string;
    global?: boolean;
    allSlides?: number[];
    allSlidesExcept?: number[];
  }>;
}

export interface ContentPreviewProps {
  markdown: string;
  config: PresentationConfig;
  editingSlide?: number;
}

export interface PresentationToolbarProps {
  config: PresentationConfig;
  onConfigChange: (config: PresentationConfig) => void;
}
