declare module "react-sparklines" {
    import * as React from "react";
  
    export interface SparklinesProps {
      data: number[];
      width?: number;
      height?: number;
      margin?: number;
      preserveAspectRatio?: string;
      svgWidth?: number;
      svgHeight?: number;
      style?: React.CSSProperties;
      className?: string;
      children?: React.ReactNode; 
    }
  
    export interface SparklinesLineProps {
      color?: string;
      style?: React.CSSProperties;
      onMouseMove?: React.MouseEventHandler<SVGPathElement>;
      onMouseLeave?: React.MouseEventHandler<SVGPathElement>;
    }
  
    export class Sparklines extends React.Component<SparklinesProps> {}
    export class SparklinesLine extends React.Component<SparklinesLineProps> {}
  }
  