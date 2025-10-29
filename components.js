// UI Components Rendering

const Components = {
    // Dashboard View
    renderDashboard() {
        console.log('🎨 [COMPONENT] Rendering dashboard');
        return `
            <div class="page-header">
                <h1 class="page-title">لوحة التحكم</h1>
            </div>
            
            <div class="stats-grid" id="statsGrid">
                <div class="stat-card">
                    <div class="stat-icon">🏢</div>
                    <div class="stat-content">
                        <div class="stat-label">إجمالي الفروع</div>
                        <div class="stat-value" id="totalBranches">0</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📋</div>
                    <div class="stat-content">
                        <div class="stat-label">إجمالي التقارير</div>
                        <div class="stat-value" id="totalReports">0</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">✅</div>
                    <div class="stat-content">
                        <div class="stat-label">إجمالي المهام</div>
                        <div class="stat-value" id="totalTasks">0</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">⚠️</div>
                    <div class="stat-content">
                        <div class="stat-label">المطلوبات غير المكتملة</div>
                        <div class="stat-value" id="pendingTasks">0</div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">⚠️ المطلوبات غير المكتملة</h3>
                </div>
                <div id="incompleteRequireds">جاري التحميل...</div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">أحدث تقارير المتابعة</h3>
                </div>
                <div id="recentReports">جاري التحميل...</div>
            </div>
        `;
    },

    // Branches View
    renderBranches() {
        return `
            <div class="page-header">
                <h1 class="page-title">إدارة الفروع</h1>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="App.showAddBranchModal()">➕ إضافة فرع جديد</button>
                </div>
            </div>

            <div class="filters">
                <div class="filters-grid">
                    <div class="form-group">
                        <input type="text" id="branchSearch" class="form-control" placeholder="بحث عن فرع...">
                    </div>
                </div>
            </div>

            <div id="branchesList" class="grid grid-2">جاري التحميل...</div>
        `;
    },

    // Branch Card
    renderBranchCard(branch) {
        const followUpsCount = branch.follow_ups?.length || 0;
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">🏢 ${Utils.escapeHtml(branch.name)}</h3>
                    <div class="card-actions">
                        <button class="btn btn-small btn-secondary" onclick="App.editBranch('${branch.documentId}')" title="تعديل">✏️</button>
                        <button class="btn btn-small btn-danger" onclick="App.deleteBranch('${branch.documentId}')" title="حذف">🗑️</button>
                    </div>
                </div>

                <div>
                    <p style="color: var(--text-secondary); margin-bottom: 12px;">
                        ${branch.info ? Utils.truncate(branch.info, 100) : 'لا توجد معلومات'}
                    </p>
                    <div class="badge badge-info">📋 ${followUpsCount} تقرير متابعة</div>
                </div>
            </div>
        `;
    },

    // Follow-ups View
    renderFollowUps() {
        return `
            <div class="page-header">
                <h1 class="page-title">تقارير المتابعة</h1>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="App.showAddFollowUpModal()">➕ إضافة تقرير جديد</button>
                </div>
            </div>

            <div class="filters">
                <div class="filters-grid">
                    <div class="form-group">
                        <select id="branchFilter" class="form-control">
                            <option value="">جميع الفروع</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <input type="text" id="responsibleFilter" class="form-control" placeholder="بحث بالمسؤول...">
                    </div>
                    <div class="form-group">
                        <input type="date" id="dateFilter" class="form-control">
                    </div>
                </div>
            </div>

            <div id="followUpsList">جاري التحميل...</div>
        `;
    },

    // Follow-up Item
    renderFollowUpItem(followUp) {
        const branchName = followUp.branch?.name || 'غير محدد';
        const date = Utils.formatDate(followUp.date);
        const responsible = followUp.responsible || 'غير محدد';
        const recommendations = followUp.Recommendations || 'لا توجد توصيات';
        const mediaCount = followUp.media?.length || 0;

  return `
        <div class="list-item" onclick="App.viewFollowUp('${followUp.documentId}')">
            <div class="list-item-header">
                <h3 class="list-item-title">📋 ${Utils.escapeHtml(branchName)}</h3>
                <div class="list-item-actions" onclick="event.stopPropagation()">
                    <button class="btn btn-small btn-secondary" onclick="App.editFollowUp('${followUp.documentId}')" title="تعديل">✏️</button>
                    <button class="btn btn-small btn-danger" onclick="App.deleteFollowUp('${followUp.documentId}')" title="حذف">🗑️</button>
                </div>
            </div>                
            <div class="list-item-content">
                    <p><strong>التوصيات:</strong> ${Utils.truncate(Utils.escapeHtml(recommendations), 150)}</p>
                </div>
                <div class="list-item-meta">
                    <span>📅 ${date}</span>
                    <span>👤 ${Utils.escapeHtml(responsible)}</span>
                    ${mediaCount > 0 ? `<span>📎 ${mediaCount} ملف</span>` : ''}
                </div>
            </div>
        `;
    },

    // Tasks View
    renderTasks() {
        return `
            <div class="page-header">
                <h1 class="page-title">المهام والمطلوبات</h1>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="App.showAddTaskModal()">➕ إضافة مهمة جديدة</button>
                </div>
            </div>

            <div class="filters">
                <div class="filters-grid">
                    <div class="form-group">
                        <select id="taskStatusFilter" class="form-control" onchange="App.filterTasks()">
                            <option value="all">جميع المهام</option>
                            <option value="completed">المكتملة</option>
                            <option value="pending">قيد التنفيذ</option>
                        </select>
                    </div>
                </div>
            </div>

            <div id="tasksList">جاري التحميل...</div>
        `;
    },

    // Task Item
    renderTaskItem(task) {
        const requireds = task.requireds || [];
        const completion = Utils.calculateCompletion(requireds);
        const isExpanded = APP_STATE.expandedTasks?.includes(task.documentId);

        return `
            <div class="task-item">
                <div class="task-header" onclick="App.toggleTask('${task.documentId}')">
                    <div class="task-info">
                        <h3 class="task-title">✅ ${Utils.escapeHtml(task.title)}</h3>
                        
                    </div>
                    <div class="card-actions" onclick="event.stopPropagation()">
                        <button class="btn btn-small btn-secondary" onclick="App.showAddRequiredModal('${task.documentId}')" title="إضافة مطلوب">➕</button>
                        <button class="btn btn-small btn-secondary" onclick="App.editTask('${task.documentId}')" title="تعديل">✏️</button>
                        <button class="btn btn-small btn-danger" onclick="App.deleteTask('${task.documentId}')" title="حذف">🗑️</button>
                    </div>
                </div>
                ${isExpanded ? this.renderRequirements(requireds, task.documentId) : ''}
            </div>
        `;
    },


    // Requirements List
    renderRequirements(requireds, taskDocumentId) {
        if (!requireds || requireds.length === 0) {
            return `
                <div class="task-requirements">
                    <p style="text-align: center; color: var(--text-secondary);">لا توجد مطلوبات لهذه المهمة</p>
                </div>
            `;
        }

        return `
            <div class="task-requirements">
                ${requireds.map(req => `
                    <div class="requirement-item ${req.completion ? 'requirement-completed' : ''}">
                        <input type="checkbox" 
                            class="requirement-checkbox" 
                            ${req.completion ? 'checked' : ''}
                            onchange="App.toggleRequirement('${req.documentId}', this.checked)">
                        <div class="requirement-content">
                            <div class="requirement-description">
                                ${Utils.escapeHtml(req.description || 'لا يوجد وصف')}
                            </div>
                            ${req.note ? `<div class="requirement-note">ملاحظة: ${Utils.escapeHtml(req.note)}</div>` : ''}
                        </div>
                        <div class="card-actions">
                            <button class="btn btn-small btn-secondary" onclick="App.editRequired('${req.documentId}')" title="تعديل">✏️</button>
                            <button class="btn btn-small btn-danger" onclick="App.deleteRequired('${req.documentId}')" title="حذف">🗑️</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },


    // Modal for adding/editing branch
    renderBranchModal(branch = null) {
        const isEdit = !!branch;
        const title = isEdit ? 'تعديل الفرع' : 'إضافة فرع جديد';

        return `
            <div class="modal">
                <div class="modal-header">
                    <h2 class="modal-title">${title}</h2>
                    <button class="modal-close" onclick="App.closeModal()">✕</button>
                </div>
                <form id="branchForm" onsubmit="App.submitBranch(event, ${branch?.id || 'null'})">
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="branchName">اسم الفرع *</label>
                            <input type="text" id="branchName" class="form-control" value="${branch?.name || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="branchInfo">معلومات الفرع</label>
                            <textarea id="branchInfo" class="form-control">${branch?.info || ''}</textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn btn-primary">حفظ</button>
                        <button type="button" class="btn btn-outline" onclick="App.closeModal()">إلغاء</button>
                    </div>
                </form>
            </div>
        `;
    },

    // Modal for adding/editing follow-up
    renderFollowUpModal(followUp = null, branches = [], tasks = []) {
        const isEdit = !!followUp;
        const title = isEdit ? 'تعديل التقرير' : 'إضافة تقرير جديد';
        
        console.log('🎨 [COMPONENT] Rendering follow-up modal with', tasks.length, 'tasks');

        return `
            <div class="modal" style="max-width: 800px;">
                <div class="modal-header">
                    <h2 class="modal-title">${title}</h2>
                    <button class="modal-close" onclick="App.closeModal()">✕</button>
                </div>
                <form id="followUpForm" onsubmit="App.submitFollowUp(event, ${followUp?.id || 'null'})">
                    <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
                        <div class="form-group">
                            <label for="followUpBranch">الفرع *</label>
                            <select id="followUpBranch" class="form-control" required>
                                <option value="">اختر الفرع</option>
                                ${branches.map(b => `
                                    <option value="${b.id}" ${followUp?.branch?.id === b.id ? 'selected' : ''}>
                                        ${Utils.escapeHtml(b.name)}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="followUpDate">التاريخ والوقت *</label>
                            <input type="datetime-local" id="followUpDate" class="form-control" 
                                value="${Utils.formatDateForInput(followUp?.date)}" required>
                        </div>
                        <!-- ✅ لا يوجد </div> هنا! -->
                        <div class="form-group">
                            <label for="followUpResponsible">المسؤول</label>
                            <input type="text" id="followUpResponsible" class="form-control" 
                                   value="${followUp?.responsible || ''}">
                        </div>
                        <div class="form-group">
                            <label for="followUpRecommendations">التوصيات</label>
                            <textarea id="followUpRecommendations" class="form-control">${followUp?.Recommendations || ''}</textarea>
                        </div>
                        
                        ${tasks.length > 0 ? `
                            <div style="margin-top: 24px; padding-top: 24px; border-top: 2px solid var(--border-color);">
                                <h4 style="margin-bottom: 16px; color: var(--primary-color);">✅ حالة المهام</h4>
                                <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 16px;">حدد حالة كل مهمة وأضف ملاحظات أو مطلوبات:</p>

                                ${tasks.map(task => {
                                    // Find existing data for this task
                                    let existingData = null;
                                    if (followUp && followUp.branch_elements) {
                                        const element = followUp.branch_elements.find(e => {
                                            // Handle different response formats
                                            const taskData = e.tasks;
                                            
                                            // Case 1: tasks is an object with documentId
                                            if (taskData?.documentId === task.documentId) return true;
                                            
                                            // Case 2: tasks is just documentId string
                                            if (taskData === task.documentId) return true;
                                            
                                            // Case 3: tasks is an object with id
                                            if (taskData?.id === task.id) return true;
                                            
                                            // Case 4: tasks is numeric id
                                            if (taskData === task.id) return true;
                                            
                                            return false;
                                        });
                                        
                                        if (element) {
                                            existingData = {
                                                completion: element.completion || false,
                                                note: element.note || ''
                                            };
                                            console.log('✅ [COMPONENT] Found existing data for task:', task.documentId, existingData);
                                        } else {
                                            console.log('⚠️ [COMPONENT] No existing data for task:', task.documentId);
                                        }
                                    }
                                    return this.renderTaskStatusInput(task, existingData);
                                }).join('')}


                            </div>
                        ` : '<p style="color: var(--text-secondary); text-align: center; margin-top: 20px;">لا توجد مهام متاحة</p>'}
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn btn-primary">حفظ</button>
                        <button type="button" class="btn btn-outline" onclick="App.closeModal()">إلغاء</button>
                    </div>
                </form>
            </div>
        `;
    },

    // Modal for viewing follow-up details
    renderFollowUpDetail(followUp) {
        const branchName = followUp.branch?.name || 'غير محدد';
        const date = Utils.formatDate(followUp.date);
        const responsible = followUp.responsible || 'غير محدد';
        const recommendations = followUp.Recommendations || 'لا توجد توصيات';
        const media = followUp.media || [];

        return `
            <div class="modal">
                <div class="modal-header">
                    <h2 class="modal-title">تفاصيل التقرير</h2>
                    <button class="modal-close" onclick="App.closeModal()">✕</button>
                </div>
                <div class="modal-body">
                    <div style="margin-bottom: 16px;">
                        <strong>الفرع:</strong> ${Utils.escapeHtml(branchName)}
                    </div>
                    <div style="margin-bottom: 16px;">
                        <strong>التاريخ:</strong> ${date}
                    </div>
                    <div style="margin-bottom: 16px;">
                        <strong>المسؤول:</strong> ${Utils.escapeHtml(responsible)}
                    </div>
                    <div style="margin-bottom: 16px;">
                        <strong>التوصيات:</strong>
                        <p style="margin-top: 8px; white-space: pre-wrap;">${Utils.escapeHtml(recommendations)}</p>
                    </div>
                    ${media.length > 0 ? `
                        <div>
                            <strong>الملفات المرفقة:</strong>
                            <div class="media-grid">
                                ${media.map(file => {
                                    const url = file.url.startsWith('http') ? file.url : `${CONFIG.UPLOAD_URL}${file.url}`;
                                    const isImage = file.mime?.startsWith('image/');
                                    return `
                                        <div class="media-item">
                                            ${isImage ? 
                                                `<img src="${url}" alt="${file.name}">` :
                                                `<a href="${url}" target="_blank" title="${file.name}">📄</a>`
                                            }
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="App.closeModal()">إغلاق</button>
                </div>
            </div>
        `;
    },

    // Modal for adding/editing task
    renderTaskModal(task = null) {
        const isEdit = !!task;
        const title = isEdit ? 'تعديل المهمة' : 'إضافة مهمة جديدة';

        return `
            <div class="modal">
                <div class="modal-header">
                    <h2 class="modal-title">${title}</h2>
                    <button class="modal-close" onclick="App.closeModal()">✕</button>
                </div>
                <form id="taskForm" onsubmit="App.submitTask(event, ${task?.id || 'null'})">
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="taskTitle">عنوان المهمة *</label>
                            <input type="text" id="taskTitle" class="form-control" value="${task?.title || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="taskNote">ملاحظات</label>
                            <textarea id="taskNote" class="form-control">${task?.note || ''}</textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn btn-primary">حفظ</button>
                        <button type="button" class="btn btn-outline" onclick="App.closeModal()">إلغاء</button>
                    </div>
                </form>
            </div>
        `;
    },

    // Modal for adding/editing required
    renderRequiredModal(required = null, taskId = null) {
        const isEdit = !!required;
        const title = isEdit ? 'تعديل المطلوب' : 'إضافة مطلوب جديد';

        return `
            <div class="modal">
                <div class="modal-header">
                    <h2 class="modal-title">${title}</h2>
                    <button class="modal-close" onclick="App.closeModal()">✕</button>
                </div>
                <form id="requiredForm" onsubmit="App.submitRequired(event, ${required?.id || 'null'}, ${taskId})">
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="requiredDescription">الوصف *</label>
                            <textarea id="requiredDescription" class="form-control" required>${required?.description || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label for="requiredNote">ملاحظة</label>
                            <textarea id="requiredNote" class="form-control">${required?.note || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="requiredCompletion" ${required?.completion ? 'checked' : ''}>
                                مكتمل
                            </label>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn btn-primary">حفظ</button>
                        <button type="button" class="btn btn-outline" onclick="App.closeModal()">إلغاء</button>
                    </div>
                </form>
            </div>
        `;
    },

    // Task Status Input for Follow-up Modal
    renderTaskStatusInput(task, existingData = null) {
        // existingData should be: { completion: boolean, note: string }
        const isChecked = existingData?.completion ? 'checked' : '';
        const noteValue = existingData?.note || '';
        
        return `
            <div class="card" style="margin-bottom: 12px; padding: 16px;">
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                    <input type="checkbox" 
                        class="task-status-checkbox" 
                        data-task-document-id="${task.documentId}"
                        id="taskCheck_${task.documentId}"
                        ${isChecked}
                        style="margin-top: 4px; width: 20px; height: 20px; cursor: pointer;">
                    <div style="flex: 1;">
                        <label for="taskCheck_${task.documentId}" style="cursor: pointer; font-weight: 600; margin-bottom: 8px; display: block;">
                            ${Utils.escapeHtml(task.title)}
                        </label>
                        ${task.note ? `<p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 8px;">${Utils.escapeHtml(task.note)}</p>` : ''}
                        <div class="form-group" style="margin: 0;">
                            <label style="font-size: 13px; margin-bottom: 4px;">ملاحظات:</label>
                            <textarea id="taskNote_${task.documentId}" 
                                    class="form-control" 
                                    placeholder="أضف ملاحظات..."
                                    rows="2"
                                    style="font-size: 13px;">${Utils.escapeHtml(noteValue)}</textarea>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },


    // Render Incomplete Requireds for Dashboard
    renderIncompleteRequireds(requireds) {
        console.log('🎨 [COMPONENT] Rendering', requireds.length, 'incomplete requireds');
        
        if (requireds.length === 0) {
            return this.renderEmptyState('✅', 'جميع المطلوبات مكتملة!');
        }

        return requireds.slice(0, 10).map(req => `
            <div class="requirement-item" style="margin-bottom: 12px;">
                <input type="checkbox" 
                       class="requirement-checkbox" 
                       onchange="App.toggleRequirement(${req.id}, this.checked)">
                <div class="requirement-content">
                    <div class="requirement-description">
                        ${Utils.escapeHtml(req.description || 'لا يوجد وصف')}
                    </div>
                    ${req.note ? `<div class="requirement-note">ملاحظة: ${Utils.escapeHtml(req.note)}</div>` : ''}
                    ${req.task ? `<div class="requirement-note">المهمة: ${Utils.escapeHtml(req.task.title || 'غير محدد')}</div>` : ''}
                </div>
                <div class="card-actions">
                    <button class="btn btn-small btn-success" 
                            onclick="App.toggleRequirement(${req.id}, true)" 
                            title="إكمال">✅</button>
                    <button class="btn btn-small btn-secondary" 
                            onclick="App.editRequired(${req.id})" 
                            title="تعديل">✏️</button>
                </div>
            </div>
        `).join('');
    },

    // Empty state
    renderEmptyState(icon, message) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">${icon}</div>
                <div class="empty-state-text">${message}</div>
            </div>
        `;
    }
};