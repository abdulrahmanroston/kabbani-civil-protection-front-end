// Main Application Logic

const App = {
    // Initialize application
    init() {
        // Initialize authentication
        Auth.init();

        // Setup navigation
        this.setupNavigation();

        // Setup mobile menu
        this.setupMobileMenu();

        // Load initial view if authenticated
        if (Auth.isAuthenticated()) {
            this.loadView('dashboard');
        }
    },

    // Setup navigation
    setupNavigation() {
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = item.getAttribute('data-view');
                this.loadView(view);
                
                // Update active state
                menuItems.forEach(m => m.classList.remove('active'));
                item.classList.add('active');

                // Close mobile menu
                const sidebar = document.getElementById('sidebar');
                if (sidebar) sidebar.classList.remove('active');
            });
        });
    },

    // Setup mobile menu
    setupMobileMenu() {
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');

        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });

            // Close sidebar when clicking outside
            document.addEventListener('click', (e) => {
                if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                    sidebar.classList.remove('active');
                }
            });
        }
    },

    // Load view
    async loadView(view) {
        console.log('\n📦 [APP] ========== Loading View:', view, '==========')
        const viewContainer = document.getElementById('viewContainer');
        if (!viewContainer) {
            console.error('❌ [APP] viewContainer not found');
            return;
        }

        APP_STATE.currentView = view;
        console.log('📋 [APP] Current view set to:', view);

        Utils.showLoading();

        try {
            switch (view) {
                case 'dashboard':
                    console.log('🏠 [APP] Loading dashboard...');
                    await this.loadDashboard();
                    break;
                case 'branches':
                    console.log('🏢 [APP] Loading branches...');
                    await this.loadBranches();
                    break;
                case 'followups':
                    console.log('📋 [APP] Loading follow-ups...');
                    await this.loadFollowUps();
                    break;
                case 'tasks':
                    console.log('✅ [APP] Loading tasks...');
                    await this.loadTasks();
                    break;
                default:
                    console.warn('⚠️ [APP] Unknown view:', view);
                    viewContainer.innerHTML = '<h1>الصفحة غير موجودة</h1>';
            }
            console.log('✅ [APP] View loaded successfully:', view);
        } catch (error) {
            console.error('❌ [APP] Error loading view:', view, error);
            Utils.showToast('حدث خطأ أثناء تحميل البيانات', 'error');
        } finally {
            Utils.hideLoading();
        }
    },

    // Load Dashboard
    async loadDashboard() {
        console.log('🔄 [APP] Starting dashboard load...');
        const viewContainer = document.getElementById('viewContainer');
        viewContainer.innerHTML = Components.renderDashboard();

        // Fetch all data
            
        const results = await Promise.allSettled([
            API.getBranches(),
            API.getFollowUps(),
            API.getTasks(),
            API.getRequireds()
        ]);

        console.log('📊 [APP] Dashboard results:', results.map(r => r.status));

        // Extract data safely
        const branches = results[0].status === 'fulfilled' ? results[0].value : [];
        const followups = results[1].status === 'fulfilled' ? results[1].value : [];
        const tasks = results[2].status === 'fulfilled' ? results[2].value : [];
        const requireds = results[3].status === 'fulfilled' ? results[3].value : [];

        // Log any failures
        results.forEach((result, index) => {
            const names = ['branches', 'followups', 'tasks', 'requireds'];
            if (result.status === 'rejected') {
                console.warn(`⚠️ [APP] Failed to load ${names[index]}:`, result.reason?.message);
            }
        });


        console.log('📊 [APP] Dashboard data loaded:', {
            branches: branches.length,
            followups: followups.length,
            tasks: tasks.length,
            requireds: requireds.length
        });

        APP_STATE.branches = branches;
        APP_STATE.followups = followups;
        APP_STATE.tasks = tasks;
        APP_STATE.requireds = requireds;

        // Update stats
        document.getElementById('totalBranches').textContent = branches.length;
        document.getElementById('totalReports').textContent = followups.length;
        document.getElementById('totalTasks').textContent = tasks.length;
        
        // Calculate incomplete requireds
        const incompleteRequireds = requireds.filter(r => !r.completion);
        console.log('⚠️ [APP] Incomplete requireds:', incompleteRequireds.length, 'of', requireds.length);
        document.getElementById('pendingTasks').textContent = incompleteRequireds.length;

        // Show incomplete requireds
        const incompleteContainer = document.getElementById('incompleteRequireds');
        if (incompleteContainer) {
            if (incompleteRequireds.length > 0) {
                console.log('📝 [APP] Displaying incomplete requireds');
                incompleteContainer.innerHTML = Components.renderIncompleteRequireds(incompleteRequireds);
            } else {
                incompleteContainer.innerHTML = Components.renderEmptyState('✅', 'جميع المطلوبات مكتملة!');
            }
        }

        // Show recent reports
        const recentReportsContainer = document.getElementById('recentReports');
        if (followups.length > 0) {
            const recentReports = followups.slice(0, 5);
            console.log('📝 [APP] Displaying', recentReports.length, 'recent reports');
            recentReportsContainer.innerHTML = recentReports.map(f => Components.renderFollowUpItem(f)).join('');
        } else {
            recentReportsContainer.innerHTML = Components.renderEmptyState('📋', 'لا توجد تقارير متابعة');
        }
        
        console.log('✅ [APP] Dashboard rendered successfully');
    },

    // Load Branches
    async loadBranches() {
        const viewContainer = document.getElementById('viewContainer');
        viewContainer.innerHTML = Components.renderBranches();

        const branches = await API.getBranches();
        APP_STATE.branches = branches;

        this.renderBranchesList(branches);

        // Setup search
        const searchInput = document.getElementById('branchSearch');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                const query = e.target.value.toLowerCase();
                const filtered = branches.filter(b => 
                    b.name.toLowerCase().includes(query)
                );
                this.renderBranchesList(filtered);
            }, 300));
        }
    },

    renderBranchesList(branches) {
        const branchesList = document.getElementById('branchesList');
        if (branches.length > 0) {
            branchesList.innerHTML = branches.map(b => Components.renderBranchCard(b)).join('');
        } else {
            branchesList.innerHTML = Components.renderEmptyState('🏢', 'لا توجد فروع');
        }
    },

    // Load Follow-ups
    async loadFollowUps() {
        const viewContainer = document.getElementById('viewContainer');
        viewContainer.innerHTML = Components.renderFollowUps();

        const [followups, branches] = await Promise.all([
            API.getFollowUps(),
            API.getBranches()
        ]);
        
        APP_STATE.followups = followups;
        APP_STATE.branches = branches;

        // Populate branch filter
        const branchFilter = document.getElementById('branchFilter');
        if (branchFilter && branches.length > 0) {
            branches.forEach(b => {
                const option = document.createElement('option');
                option.value = b.id;
                option.textContent = b.name;
                branchFilter.appendChild(option);
            });
        }

        this.renderFollowUpsList(followups);

        // Setup filters
        this.setupFollowUpFilters(followups);
    },

    setupFollowUpFilters(followups) {
        const branchFilter = document.getElementById('branchFilter');
        const responsibleFilter = document.getElementById('responsibleFilter');
        const dateFilter = document.getElementById('dateFilter');

        const applyFilters = () => {
            let filtered = [...followups];

            const branchId = branchFilter?.value;
            if (branchId) {
                filtered = filtered.filter(f => f.branch?.id == branchId);
            }

            const responsible = responsibleFilter?.value.toLowerCase();
            if (responsible) {
                filtered = filtered.filter(f => 
                    f.responsible?.toLowerCase().includes(responsible)
                );
            }

            const date = dateFilter?.value;
            if (date) {
                filtered = filtered.filter(f => {
                    const fDate = new Date(f.date).toISOString().split('T')[0];
                    return fDate === date;
                });
            }

            this.renderFollowUpsList(filtered);
        };

        branchFilter?.addEventListener('change', applyFilters);
        responsibleFilter?.addEventListener('input', Utils.debounce(applyFilters, 300));
        dateFilter?.addEventListener('change', applyFilters);
    },

    renderFollowUpsList(followups) {
        const followUpsList = document.getElementById('followUpsList');
        if (followups.length > 0) {
            followUpsList.innerHTML = followups.map(f => Components.renderFollowUpItem(f)).join('');
        } else {
            followUpsList.innerHTML = Components.renderEmptyState('📋', 'لا توجد تقارير متابعة');
        }
    },

    // Load Tasks
    async loadTasks() {
        const viewContainer = document.getElementById('viewContainer');
        viewContainer.innerHTML = Components.renderTasks();

        const tasks = await API.getTasks();
        APP_STATE.tasks = tasks;
        APP_STATE.expandedTasks = [];

        this.renderTasksList(tasks);
    },

    filterTasks() {
        const status = document.getElementById('taskStatusFilter')?.value || 'all';
        let filtered = [...APP_STATE.tasks];

        if (status === 'completed') {
            filtered = filtered.filter(t => Utils.calculateCompletion(t.requireds) === 100);
        } else if (status === 'pending') {
            filtered = filtered.filter(t => Utils.calculateCompletion(t.requireds) < 100);
        }

        this.renderTasksList(filtered);
    },

    renderTasksList(tasks) {
        const tasksList = document.getElementById('tasksList');
        if (tasks.length > 0) {
            tasksList.innerHTML = tasks.map(t => Components.renderTaskItem(t)).join('');
        } else {
            tasksList.innerHTML = Components.renderEmptyState('✅', 'لا توجد مهام');
        }
    },

    toggleTask(taskDocumentId) {
        if (!APP_STATE.expandedTasks) APP_STATE.expandedTasks = [];
        
        const index = APP_STATE.expandedTasks.indexOf(taskDocumentId);
        if (index > -1) {
            APP_STATE.expandedTasks.splice(index, 1);
        } else {
            APP_STATE.expandedTasks.push(taskDocumentId);
        }

        this.loadTasks();
    },

    // Modal functions
    showModal(content) {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = content;
        modalContainer.classList.remove('hidden');
    },

    closeModal() {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.classList.add('hidden');
        modalContainer.innerHTML = '';
    },

    // Branch CRUD
    showAddBranchModal() {
        this.showModal(Components.renderBranchModal());
    },

    async editBranch(id) {
        Utils.showLoading();
        try {
            const branch = await API.getBranch(id);
            this.showModal(Components.renderBranchModal(branch));
        } catch (error) {
            if (error.message.includes('404') || error.message.includes('Not Found')) {
                Utils.showToast('⚠️ هذا الفرع غير موجود أو تم حذفه', 'warning');
                this.loadBranches(); // Reload the list
            } else {
                Utils.showToast(error.message, 'error');
            }
        } finally {
            Utils.hideLoading();
        }
    },

    async submitBranch(event, idOrDocumentId) {
        event.preventDefault();
        Utils.showLoading();

        const name = document.getElementById('branchName').value;
        const info = document.getElementById('branchInfo').value;

        try {
            if (idOrDocumentId) {
                // Find the branch to get documentId if numeric id was passed
                const branch = APP_STATE.branches.find(b => 
                    b.id == idOrDocumentId || b.documentId == idOrDocumentId
                );
                if (!branch) {
                    console.error('❌ [APP] Branch not found');
                    Utils.showToast('الفرع غير موجود', 'error');
                    return;
                }
                await API.updateBranch(branch.documentId, { name, info });
                Utils.showToast('تم تحديث الفرع بنجاح', 'success');
            } else {
                await API.createBranch({ name, info });
                Utils.showToast('تم إضافة الفرع بنجاح', 'success');
            }
            this.closeModal();
            this.loadBranches();
        } catch (error) {
            Utils.showToast(error.message, 'error');
        } finally {
            Utils.hideLoading();
        }
    },

    async deleteBranch(id) {
        if (!Utils.confirmAction('هل أنت متأكد من حذف هذا الفرع؟')) return;

        Utils.showLoading();
        try {
            await API.deleteBranch(id);
            Utils.showToast('تم حذف الفرع بنجاح', 'success');
            this.loadBranches();
        } catch (error) {
            Utils.showToast(error.message, 'error');
        } finally {
            Utils.hideLoading();
        }
    },

    // Follow-up CRUD
    async showAddFollowUpModal() {
        console.log('🔄 [APP] Opening add follow-up modal...');
        console.log('📊 [APP] Available branches:', APP_STATE.branches?.length || 0);
        console.log('📊 [APP] Available tasks:', APP_STATE.tasks?.length || 0);
        
        // Ensure we have tasks loaded
        if (!APP_STATE.tasks || APP_STATE.tasks.length === 0) {
            console.log('🔄 [APP] Tasks not loaded, fetching...');
            try {
                APP_STATE.tasks = await API.getTasks();
                console.log('✅ [APP] Tasks loaded:', APP_STATE.tasks.length);
            } catch (error) {
                console.error('❌ [APP] Failed to load tasks:', error);
            }
        }
        
        this.showModal(Components.renderFollowUpModal(null, APP_STATE.branches, APP_STATE.tasks));
    },

    async editFollowUp(id) {
        Utils.showLoading();
        try {
            const followUp = await API.getFollowUp(id);
            this.showModal(Components.renderFollowUpModal(followUp, APP_STATE.branches, APP_STATE.tasks));
        } catch (error) {
            if (error.message.includes('404') || error.message.includes('Not Found')) {
                Utils.showToast('⚠️ هذا التقرير غير موجود أو تم حذفه', 'warning');
                this.loadFollowUps();
            } else {
                Utils.showToast(error.message, 'error');
            }
        } finally {
            Utils.hideLoading();
        }
    },

    async editFollowUp(idOrDocumentId) {
        Utils.showLoading();
        try {
            // Find the followUp to get documentId if numeric id was passed
            const followUp = APP_STATE.followups.find(f => 
                f.id == idOrDocumentId || f.documentId == idOrDocumentId
            );
            
            if (!followUp) {
                console.error('❌ [APP] Follow-up not found');
                Utils.showToast('التقرير غير موجود', 'error');
                Utils.hideLoading();  // ✅ أخفِ التحميل حتى في حالة الخطأ
                return;
            }

            const fullFollowUp = await API.getFollowUp(followUp.documentId);
            
            // Console logs للتشخيص
            console.log('🔍 [APP] EditFollowUp - Full data:', fullFollowUp);
            console.log('🔍 [APP] EditFollowUp - branch_elements:', fullFollowUp.branch_elements);
            if (fullFollowUp.branch_elements && fullFollowUp.branch_elements.length > 0) {
                console.log('🔍 [APP] EditFollowUp - First element:', fullFollowUp.branch_elements[0]);
                console.log('🔍 [APP] EditFollowUp - tasks structure:', fullFollowUp.branch_elements[0].tasks);
            }
            
            this.showModal(Components.renderFollowUpModal(fullFollowUp, APP_STATE.branches, APP_STATE.tasks));
            
        } catch (error) {
            if (error.message.includes('404') || error.message.includes('Not Found')) {
                Utils.showToast('⚠️ هذا التقرير غير موجود أو تم حذفه', 'warning');
                this.loadFollowUps();
            } else {
                Utils.showToast(error.message, 'error');
            }
        } finally {
            Utils.hideLoading();  // ✅ أهم سطر - يخفي التحميل دائماً
        }
    },




    async viewFollowUp(id) {
        Utils.showLoading();
        try {
            const followUp = await API.getFollowUp(id);
            this.showModal(Components.renderFollowUpDetail(followUp));
        } catch (error) {
            if (error.message.includes('404') || error.message.includes('Not Found')) {
                Utils.showToast('⚠️ هذا التقرير غير موجود أو تم حذفه', 'warning');
                this.loadFollowUps(); // Reload the list
            } else {
                Utils.showToast(error.message, 'error');
            }
        } finally {
            Utils.hideLoading();
        }
    },


    async submitFollowUp(event, id) {
        event.preventDefault();
        console.log('\n📤 [APP] ========== Submitting Follow-Up ==========');
        console.log('🔢 [APP] Follow-up ID:', id || 'new');
        
        Utils.showLoading();

        const branch = document.getElementById('followUpBranch').value;
        const date = document.getElementById('followUpDate').value;
        const responsible = document.getElementById('followUpResponsible').value;
        const Recommendations = document.getElementById('followUpRecommendations').value;

        // Collect task statuses and notes
        const taskCheckboxes = document.querySelectorAll('.task-status-checkbox');
        const branch_elements = [];
        
        console.log('📊 [APP] Processing', taskCheckboxes.length, 'tasks...');
        
    
        
    // ✅ الكود الصحيح
    taskCheckboxes.forEach(checkbox => {
        const taskDocumentId = checkbox.dataset.taskDocumentId;
        const isCompleted = checkbox.checked;
        const noteInput = document.getElementById(`taskNote_${taskDocumentId}`);
        
        // No need to find task - use documentId directly
        const taskData = {
            tasks: taskDocumentId,  // ✅ استخدم documentId مباشرة
            completion: isCompleted,
            note: noteInput ? noteInput.value : ''
        };
        
        console.log(`📝 [APP] Task ${taskDocumentId}:`, taskData);
        branch_elements.push(taskData);
    });


    // Find branch documentId
    const selectedBranch = APP_STATE.branches.find(b => b.id == parseInt(branch));
    if (!selectedBranch) {
        console.error('❌ [APP] Branch not found for id:', branch);
        Utils.showToast('الفرع المحدد غير موجود', 'error');
        return;
    }

    const data = {
        branch: selectedBranch.documentId,  // ✅ استخدم documentId
        date,
        responsible,
        Recommendations,
        branch_elements
    };

    console.log('📤 [APP] Complete follow-up data:', data);

    try {
        if (id) {
            console.log('🔄 [APP] Updating existing follow-up...');
            // Find the followUp to get documentId
            const followUp = APP_STATE.followups.find(f => f.id == id || f.documentId == id);
            if (!followUp) {
                console.error('❌ [APP] Follow-up not found for id:', id);
                Utils.showToast('التقرير غير موجود', 'error');
                return;
            }
            await API.updateFollowUp(followUp.documentId, data);  // ✅ استخدم documentId
            console.log('✅ [APP] Follow-up updated successfully');
            Utils.showToast('تم تحديث التقرير بنجاح', 'success');
        } else {
            console.log('🔄 [APP] Creating new follow-up...');
            const result = await API.createFollowUp(data);
            console.log('✅ [APP] Follow-up created successfully:', result);
            Utils.showToast('تم إضافة التقرير بنجاح', 'success');
        }   
            this.closeModal();
            await this.loadFollowUps();
        } catch (error) {
            console.error('❌ [APP] Follow-up submission failed:', error);
            Utils.showToast(error.message, 'error');
        } finally {
            Utils.hideLoading();
        }
    },

    async deleteFollowUp(id) {
        if (!Utils.confirmAction('هل أنت متأكد من حذف هذا التقرير؟')) return;

        Utils.showLoading();
        try {
            await API.deleteFollowUp(id);
            Utils.showToast('تم حذف التقرير بنجاح', 'success');
            this.loadFollowUps();
        } catch (error) {
            Utils.showToast(error.message, 'error');
        } finally {
            Utils.hideLoading();
        }
    },

    // Task CRUD
    showAddTaskModal() {
        this.showModal(Components.renderTaskModal());
    },

    async editTask(id) {
        Utils.showLoading();
        try {
            const task = await API.getTask(id);
            this.showModal(Components.renderTaskModal(task));
        } catch (error) {
            Utils.showToast(error.message, 'error');
        } finally {
            Utils.hideLoading();
        }
    },

    async submitTask(event, idOrDocumentId) {
        event.preventDefault();
        Utils.showLoading();

        const title = document.getElementById('taskTitle').value;
        const note = document.getElementById('taskNote').value;

        try {
            if (idOrDocumentId) {
                // Find the task to get documentId if numeric id was passed
                const task = APP_STATE.tasks.find(t => 
                    t.id == idOrDocumentId || t.documentId == idOrDocumentId
                );
                if (!task) {
                    console.error('❌ [APP] Task not found');
                    Utils.showToast('المهمة غير موجودة', 'error');
                    return;
                }
                await API.updateTask(task.documentId, { title, note });
                Utils.showToast('تم تحديث المهمة بنجاح', 'success');
            } else {
                await API.createTask({ title, note });
                Utils.showToast('تم إضافة المهمة بنجاح', 'success');
            }
            this.closeModal();
            this.loadTasks();
        } catch (error) {
            Utils.showToast(error.message, 'error');
        } finally {
            Utils.hideLoading();
        }
    },

    async deleteTask(id) {
        if (!Utils.confirmAction('هل أنت متأكد من حذف هذه المهمة؟')) return;

        Utils.showLoading();
        try {
            await API.deleteTask(id);
            Utils.showToast('تم حذف المهمة بنجاح', 'success');
            this.loadTasks();
        } catch (error) {
            Utils.showToast(error.message, 'error');
        } finally {
            Utils.hideLoading();
        }
    },

    // Required CRUD
    showAddRequiredModal(taskId) {
        this.showModal(Components.renderRequiredModal(null, taskId));
    },

    async editRequired(id) {
        Utils.showLoading();
        try {
            const requireds = await API.getRequireds();
            const required = requireds.find(r => r.id === id);
            if (required) {
                this.showModal(Components.renderRequiredModal(required));
            }
        } catch (error) {
            Utils.showToast(error.message, 'error');
        } finally {
            Utils.hideLoading();
        }
    },

    async submitRequired(event, id, taskId) {
        event.preventDefault();
        Utils.showLoading();

        const description = document.getElementById('requiredDescription').value;
        const note = document.getElementById('requiredNote').value;
        const completion = document.getElementById('requiredCompletion').checked;

        const data = {
            description,
            note,
            completion
        };

        if (taskId && !id) {
            data.task = taskId;
        }

        try {
            if (id) {
                await API.updateRequired(id, data);
                Utils.showToast('تم تحديث المطلوب بنجاح', 'success');
            } else {
                await API.createRequired(data);
                Utils.showToast('تم إضافة المطلوب بنجاح', 'success');
            }
            this.closeModal();
            this.loadTasks();
        } catch (error) {
            Utils.showToast(error.message, 'error');
        } finally {
            Utils.hideLoading();
        }
    },

    async toggleRequirement(id, completed) {
        console.log('🔄 [APP] Toggling requirement:', id, 'to', completed);
        Utils.showLoading();
        try {
            await API.updateRequired(id, { completion: completed });
            console.log('✅ [APP] Requirement toggled successfully');
            await this.loadTasks();
        } catch (error) {
            console.error('❌ [APP] Failed to toggle requirement:', error);
            Utils.showToast('فشل تحديث حالة المطلوب', 'error');
        } finally {
            Utils.hideLoading();
        }
    },

    async deleteRequired(id) {
        if (!Utils.confirmAction('هل أنت متأكد من حذف هذا المطلوب؟')) return;

        Utils.showLoading();
        try {
            await API.deleteRequired(id);
            Utils.showToast('تم حذف المطلوب بنجاح', 'success');
            this.loadTasks();
        } catch (error) {
            Utils.showToast(error.message, 'error');
        } finally {
            Utils.hideLoading();
        }
    }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}