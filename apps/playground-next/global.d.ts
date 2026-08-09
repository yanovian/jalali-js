// Next 15 (still in the compat matrix) ships no ambient CSS-import declaration, unlike a
// newer major, so typecheck fails app/page.tsx's date-picker.css side-effect import.
declare module '*.css';
