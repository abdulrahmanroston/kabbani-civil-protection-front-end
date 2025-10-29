// API Configuration
const CONFIG = {
    API_URL: 'https://uplifting-presence-2e941f1ba9.strapiapp.com/api',
    UPLOAD_URL: 'https://uplifting-presence-2e941f1ba9.strapiapp.com',
    // Note: JWT token will be stored in memory (not localStorage due to sandbox restrictions)
    // In a production environment, you would use proper authentication mechanisms
};

console.log('🔧 [CONFIG] Configuration loaded');
console.log('🔗 [CONFIG] API URL:', CONFIG.API_URL);
console.log('💾 [CONFIG] Using in-memory state (no localStorage/sessionStorage)');

// Global state - using JavaScript variables instead of localStorage
const APP_STATE = {
    token: null,
    user: null,
    currentView: 'dashboard',
    branches: [],
    followups: [],
    tasks: [],
    requireds: []
};

console.log('✅ [CONFIG] APP_STATE initialized');
console.log('📊 [CONFIG] State structure:', Object.keys(APP_STATE));
