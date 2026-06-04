<template>
  <footer class="footer">
    <b-container fluid>
      <b-row>
        <b-col cols="12" class="text-center">
          {{ currentYear }} &copy; kebaikan
        </b-col>
      </b-row>
    </b-container>
  </footer>
</template>

<script setup lang="ts">
import { currentYear } from "@/helpers/constants";
</script>
