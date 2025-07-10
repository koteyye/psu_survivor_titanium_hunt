// Типы для UI компонентов
export interface UIElementOptions {
  visible?: boolean;
  interactive?: boolean;
  alpha?: number;
}

export interface ButtonOptions extends UIElementOptions {
  width?: number;
  height?: number;
  fontSize?: number | string;
  backgroundColor?: number;
  textColor?: number;
  hoverColor?: number;
  clickColor?: number;
  pulseAnimation?: boolean;
  callback?: () => void;
}

export interface ButtonCallback {
  width?: number;
  height?: number;
  fontSize?: number | string;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  hoverColor?: string;
  pulseAnimation?: boolean;
  callback?: () => void;
}

export interface BarOptions extends UIElementOptions {
  width?: number;
  height?: number;
  maxValue?: number;
  currentValue?: number;
  barColor?: number;
  backgroundColor?: number;
  borderColor?: number;
  showValue?: boolean;
  iconKey?: string;
}

export interface TitleOptions extends UIElementOptions {
  fontSize?: number;
  color?: number;
  glowColor?: number;
  pulseAnimation?: boolean;
  typewriterEffect?: boolean;
}

export interface SwitchOptions extends UIElementOptions {
  width?: number;
  height?: number;
  initialState?: boolean;
  onTexture?: string;
  offTexture?: string;
}

export interface ICyberUIElement {
  x: number;
  y: number;
  visible: boolean;
  
  setVisible(visible: boolean): void;
  destroy(): void;
}

export interface CyberButtonOptions {
  width?: number;
  height?: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  hoverColor?: string;
  pulseAnimation?: boolean;
}

export interface CyberCardOptions extends CyberButtonOptions {
  cardWidth?: number;
  cardHeight?: number;
  imageScale?: number;
}

export interface CyberTitleOptions {
  fontSize?: number | string;
  fontFamily?: string;
  color?: string;
  glowIntensity?: number;
  pulseAnimation?: boolean;
  align?: string;
}
