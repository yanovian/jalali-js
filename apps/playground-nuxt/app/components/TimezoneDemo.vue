<script setup lang="ts">
/**
 * Exercises the SSR-safe timezone resolution from architecture.md's SSR note: the server
 * render (and the client's first, hydrating render) always reads 'UTC' here, since there is no
 * `window` during the server render. `onMounted`, inside the composable, then re-resolves the
 * real browser timezone once mounted, and this line updates to that value without a hydration
 * warning. Unlike Next.js, Nuxt has no separate "client component" concept to opt into: every
 * component is server-rendered then hydrated by default, so no extra wrapping is needed here.
 */
import { useResolvedTimeZone } from '@jalali-js/vue';

const timeZone = useResolvedTimeZone('auto');
</script>

<template>
  <p data-testid="resolved-timezone">
    Resolved timezone (<code>timeZone: 'auto'</code>): <strong>{{ timeZone }}</strong>
  </p>
</template>
