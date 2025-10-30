// Application Version
const APP_VERSION = '1.0.0';

// API Configuration
const CONFIG = {
    API_URL: 'https://uplifting-presence-2e941f1ba9.strapiapp.com/api',
    UPLOAD_URL: 'https://uplifting-presence-2e941f1ba9.strapiapp.com',
    VERSION: APP_VERSION
};

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
