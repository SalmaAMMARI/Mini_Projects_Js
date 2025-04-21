// src/sharedState.js
import { reactive } from 'vue';

export const sharedState = reactive({
  userProfile: {
    photoURL: null,
    displayName: ''
  }
});