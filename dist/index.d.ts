import * as react_jsx_runtime from 'react/jsx-runtime';
import * as react from 'react';
import react__default from 'react';

interface Point {
    x: number;
    y: number;
    t: number;
}
type Stroke = Point[];
interface Candidate {
    character: string;
    score: number;
}
interface RecognizeOptions {
    language?: string;
    limit?: number;
    width?: number;
    height?: number;
}
interface HanziPadProps {
    onStrokesChange?: (strokes: Stroke[]) => void;
    width?: number;
    height?: number;
    strokeColor?: string;
    lineWidth?: number;
    background?: string;
    showGrid?: boolean;
    gridLines?: 1 | 2 | 3;
    gridColor?: string;
    className?: string;
    style?: react__default.CSSProperties;
}
interface HanziPadHandle {
    getStrokes: () => Stroke[];
    clear: () => void;
    undo: () => void;
    toDataURL: () => string | null;
}
interface HanziInputProps {
    onSelect: (character: string) => void;
    proxyUrl: string;
    language?: string;
    limit?: number;
    width?: number;
    height?: number;
    showUndo?: boolean;
    showClear?: boolean;
    background?: string;
    showGrid?: boolean;
    gridLines?: 1 | 2 | 3;
    gridColor?: string;
    className?: string;
}

declare function HanziInput({ onSelect, proxyUrl, language, limit, width, height, showUndo, showClear, background, showGrid, gridLines, gridColor, className }: HanziInputProps): react_jsx_runtime.JSX.Element;

declare const HanziPad: react.ForwardRefExoticComponent<HanziPadProps & react.RefAttributes<HanziPadHandle>>;

declare function recognizeDirect(strokes: Stroke[], options?: RecognizeOptions): Promise<Candidate[]>;
declare function recognize(strokes: Stroke[], options: RecognizeOptions & {
    proxyUrl: string;
}): Promise<Candidate[]>;
declare function createHandwritingRoute(): {
    POST: (req: Request) => Promise<Response>;
};

export { type Candidate, HanziInput, type HanziInputProps, HanziPad, type HanziPadHandle, type HanziPadProps, type Point, type RecognizeOptions, type Stroke, createHandwritingRoute, recognize, recognizeDirect };
