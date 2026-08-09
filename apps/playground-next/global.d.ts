// A newer Next.js major ships an ambient declaration for a side-effect CSS import; an older
// one (still in the compat matrix, see .github/workflows/compat-matrix.yml) does not, and
// TypeScript then fails app/page.tsx's `import '@jalali-js/react/date-picker.css'`. This
// declares it directly so typecheck does not depend on which Next major supplies it.
declare module '*.css';
