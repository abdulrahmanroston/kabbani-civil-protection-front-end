// Authentication Management

const Auth = {
    // Initialize authentication
    init() {
        const loginForm = document.getElementById('loginForm');
        const logoutBtn = document.getElementById('logoutBtn');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Check if user is authenticated
        this.checkAuth();
    },

    // Handle login
    async handleLogin(e) {
        e.preventDefault();
        console.log('\n🔑 [AUTH] ========== Login Attempt ==========');
        
        const identifier = document.getElementById('identifier').value;
        const password = document.getElementById('password').value;
        
        console.log('👤 [AUTH] Identifier:', identifier);

        Utils.showLoading();

        try {
            console.log('🔄 [AUTH] Sending login request...');
            const result = await API.login(identifier, password);
            console.log('✅ [AUTH] Login successful');
            console.log('📊 [AUTH] User data:', result.user);
            console.log('🔑 [AUTH] Token received:', result.jwt ? 'Yes' : 'No');
            
            // Store token and user in localStorage AND memory
            APP_STATE.token = result.jwt;
            APP_STATE.user = result.user;

            // Save to localStorage
            localStorage.setItem('auth_token', result.jwt);
            localStorage.setItem('auth_user', JSON.stringify(result.user));
            console.log('💾 [AUTH] Token and user stored in localStorage and APP_STATE');


            Utils.hideLoading();
            Utils.showToast('تم تسجيل الدخول بنجاح', 'success');
            
            // Show main app
            console.log('📺 [AUTH] Showing main app interface');
            this.showMainApp();
            
            // Load dashboard
            console.log('🏠 [AUTH] Loading dashboard view');
            App.loadView('dashboard');
        } catch (error) {
            console.error('❌ [AUTH] Login failed:', error);
            Utils.hideLoading();
            Utils.showToast(error.message || 'فشل تسجيل الدخول', 'error');
        }
    },

    // Handle logout
    handleLogout() {
        console.log('\n🚪 [AUTH] ========== Logout Attempt ==========');
        if (Utils.confirmAction('هل أنت متأكد من تسجيل الخروج؟')) {
            console.log('🗑️ [AUTH] Clearing user session...');
            
            // Clear memory
            APP_STATE.token = null;
            APP_STATE.user = null;
            
            // Clear localStorage
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            
            console.log('✅ [AUTH] Session cleared from localStorage and APP_STATE');
            this.showLoginPage();
            Utils.showToast('تم تسجيل الخروج بنجاح', 'success');
        } else {
            console.log('❌ [AUTH] Logout cancelled by user');
        }
    },

    // Check authentication status
    checkAuth() {
        console.log('\n🔐 [AUTH] ========== Checking Authentication ==========');
        
        // Try to restore from localStorage
        const savedToken = localStorage.getItem('auth_token');
        const savedUser = localStorage.getItem('auth_user');
        
        if (savedToken && savedUser) {
            try {
                APP_STATE.token = savedToken;
                APP_STATE.user = JSON.parse(savedUser);
                console.log('✅ [AUTH] Restored session from localStorage');
                console.log('👤 [AUTH] User:', APP_STATE.user.username || APP_STATE.user.email);
            } catch (error) {
                console.error('❌ [AUTH] Failed to parse saved user:', error);
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
            }
        }
        
        console.log('🔑 [AUTH] Token exists:', !!APP_STATE.token);
        console.log('👤 [AUTH] User exists:', !!APP_STATE.user);
        
        if (APP_STATE.token && APP_STATE.user) {
            console.log('✅ [AUTH] User is authenticated');
            this.showMainApp();
        } else {
            console.log('❌ [AUTH] User not authenticated, showing login page');
            this.showLoginPage();
        }
    },

    // Show login page
    showLoginPage() {
        const loginPage = document.getElementById('loginPage');
        const mainApp = document.getElementById('mainApp');
        
        if (loginPage) loginPage.classList.remove('hidden');
        if (mainApp) mainApp.classList.add('hidden');
    },

    // Show main app
    showMainApp() {
        const loginPage = document.getElementById('loginPage');
        const mainApp = document.getElementById('mainApp');
        
        if (loginPage) loginPage.classList.add('hidden');
        if (mainApp) mainApp.classList.remove('hidden');

        // Update user name
        const userName = document.getElementById('userName');
        if (userName && APP_STATE.user) {
            userName.textContent = APP_STATE.user.username || APP_STATE.user.email;
        }
    },

    // Check if authenticated
    isAuthenticated() {
        return !!(APP_STATE.token && APP_STATE.user);
    }
};