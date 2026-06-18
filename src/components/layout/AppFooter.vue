<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
  <footer class="border-t border-gold/15 py-10 mt-auto">
    <div class="container mx-auto px-4">
      <div class="flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-muted">
        <p>Arcane Forge — Transform rulebooks into epic adventures</p>
        <nav class="flex flex-wrap items-center justify-center gap-4">
          <RouterLink to="/terms" class="hover:text-gold transition">Terms</RouterLink>
          <RouterLink to="/privacy" class="hover:text-gold transition">Privacy</RouterLink>
          <RouterLink to="/upload-consent" class="hover:text-gold transition">Upload Consent</RouterLink>
          <RouterLink to="/pricing" class="hover:text-gold transition">Pricing</RouterLink>
          <a href="mailto:hello@arcaneforge.app" class="hover:text-gold transition">Support</a>
        </nav>
      </div>
      <p class="text-center text-xs text-muted/70 mt-6">
        © {{ new Date().getFullYear() }} Arcane Forge. Campaign content licensed for personal tabletop use.
      </p>
    </div>
  </footer>
</template>
