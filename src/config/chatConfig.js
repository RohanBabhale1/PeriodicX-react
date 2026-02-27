function generateSessionId() {
  const arr = new Uint8Array(12);
  crypto.getRandomValues(arr);
  return 'sess_' + [...arr].map(b => b.toString(16).padStart(2, '0')).join('');
}

export const SESSION_ID = generateSessionId();

export const CHAT_CONFIG = {
  apiUrl: '/api/chat',
  maxHistory: 6,          
  messageCooldownMs: 3_000,
  sessionTokenCap: 100_000,
  suggestions: [
    'Tell me about Gold',
    'List all noble gases',
    'Compare Carbon and Silicon',
    'What is electronegativity?',
    'Melting point of Iron',
    'Who discovered Helium?',
    'Which element has the highest density?',
    'What are actinides?',
    'Is Mercury a liquid at room temperature?',
    'Electron configuration of Carbon',
  ],
};