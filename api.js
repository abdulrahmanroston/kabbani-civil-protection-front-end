// API Functions for Strapi Integration

const API = {
    // Helper to get headers
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (APP_STATE.token) {
            headers['Authorization'] = `Bearer ${APP_STATE.token}`;
        }
        return headers;
    },

    // Authentication
    async login(identifier, password) {
        console.log('\n🔑 [API] ========== Login Request ==========');
        console.log('📡 [API] Login URL:', `${CONFIG.API_URL}/auth/local`);
        console.log('👤 [API] Identifier:', identifier);
        
        try {
            const response = await fetch(`${CONFIG.API_URL}/auth/local`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password })
            });
            
            console.log('📥 [API] Login response status:', response.status, response.statusText);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ [API] Login failed:', errorData);
                throw new Error(errorData.error?.message || 'فشل تسجيل الدخول. تحقق من البيانات.');
            }

            const data = await response.json();
            console.log('✅ [API] Login successful');
            console.log('📊 [API] User data received:', data.user?.username || data.user?.email);
            
            return data;
        } catch (error) {
            console.error('❌ [API] Login error:', error);
            throw error;
        }
    },

    // Branches
    async getBranches() {
        console.log('🔄 [API] Starting getBranches request...');
        try {
            const url = `${CONFIG.API_URL}/branches?populate[follow_ups]=true`;
            console.log('📡 [API] Fetching branches from:', url);
            
            const response = await fetch(url, {
                headers: this.getHeaders()
            });
            
            console.log('📥 [API] Branches response status:', response.status, response.statusText);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ [API] Branch fetch failed:', errorText);
                
                if (response.status === 404) {
                    throw new Error('404: الفرع غير موجود');
                }
                throw new Error('فشل جلب الفرع');
            }
            
            const result = await response.json();
            console.log('✅ [API] Branches fetched successfully:', result.data?.length, 'branches');
            console.log('📊 [API] Branches data:', result.data);
            
            return result.data || [];
        } catch (error) {
            console.error('❌ [API] Error fetching branches:', error);
            throw error;
        }
    },

    async getBranch(id) {
        console.log('🔄 [API] Starting getBranch request for ID:', id);
        try {
            const url = `${CONFIG.API_URL}/branches/${id}?populate[follow_ups]=true`;
            console.log('📡 [API] Fetching branch from:', url);
            
            const response = await fetch(url, {
                headers: this.getHeaders()
            });
            
            console.log('📥 [API] Branch response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ [API] Branch fetch failed:', errorText);
                throw new Error('فشل جلب الفرع');
            }
            
            const result = await response.json();
            console.log('✅ [API] Branch fetched successfully:', result.data);
            
            return result.data;
        } catch (error) {
            console.error('❌ [API] Error fetching branch:', error);
            throw error;
        }
    },

    async createBranch(data) {
        try {
            const response = await fetch(`${CONFIG.API_URL}/branches`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ data })
            });
            if (!response.ok) throw new Error('فشل إضافة الفرع');
            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error creating branch:', error);
            throw error;
        }
    },

    async updateBranch(id, data) {
        try {
            const response = await fetch(`${CONFIG.API_URL}/branches/${id}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify({ data })
            });
            if (!response.ok) throw new Error('فشل تحديث الفرع');
            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error updating branch:', error);
            throw error;
        }
    },

    async deleteBranch(id) {
        try {
            const response = await fetch(`${CONFIG.API_URL}/branches/${id}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            if (!response.ok) throw new Error('فشل حذف الفرع');
            return true;
        } catch (error) {
            console.error('Error deleting branch:', error);
            throw error;
        }
    },

    // Follow-ups
    async getFollowUps() {
        console.log('🔄 [API] Starting getFollowUps request...');
        try {
            const url = `${CONFIG.API_URL}/follow-ups?populate[branch]=true&populate[media]=true&populate[branch_elements]=true`;
            console.log('📡 [API] Fetching follow-ups from:', url);
            
            const response = await fetch(url, {
                headers: this.getHeaders()
            });
            
            console.log('📥 [API] Follow-ups response status:', response.status, response.statusText);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ [API] Follow-up fetch failed:', errorText);
                
                if (response.status === 404) {
                    throw new Error('404: التقرير غير موجود');
                }
                throw new Error('فشل جلب التقرير');
            }

            
            const result = await response.json();
            console.log('✅ [API] Follow-ups fetched successfully:', result.data?.length, 'reports');
            console.log('📊 [API] Follow-ups data:', result.data);
            
            return result.data || [];
        } catch (error) {
            console.error('❌ [API] Error fetching follow-ups:', error);
            throw error;
        }
    },

    async getFollowUp(id) {
        console.log('🔄 [API] Starting getFollowUp request for ID:', id);
        try {
            // const url = `${CONFIG.API_URL}/follow-ups/${id}?populate[branch]=true&populate[media]=true&populate[branch_elements][populate]=*`;
            const url = `${CONFIG.API_URL}/follow-ups/${id}?populate[branch]=true&populate[media]=true&populate[branch_elements][populate][tasks]=true`;

            console.log('📡 [API] Fetching follow-up from:', url);
            
            const response = await fetch(url, {
                headers: this.getHeaders()
            });
            
            console.log('📥 [API] Follow-up response status:', response.status);
            
            // ✅ الجديد - يضيف 404 للرسالة
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ [API] Follow-up fetch failed:', errorText);
            
            if (response.status === 404) {
                throw new Error('404: التقرير غير موجود');
            }
            throw new Error('فشل جلب التقرير');
        }

            
            const result = await response.json();
            console.log('✅ [API] Follow-up fetched successfully:', result.data);
            
            return result.data;
        } catch (error) {
            console.error('❌ [API] Error fetching follow-up:', error);
            throw error;
        }
    },

    async createFollowUp(data) {
        console.log('🔄 [API] Starting createFollowUp request...');
        console.log('📤 [API] Follow-up data to send:', data);
        try {
            const response = await fetch(`${CONFIG.API_URL}/follow-ups`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ data })
            });
            
            console.log('📥 [API] Create follow-up response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ [API] Follow-up creation failed:', errorText);
                throw new Error('فشل إضافة التقرير');
            }
            
            const result = await response.json();
            console.log('✅ [API] Follow-up created successfully:', result.data);
            
            return result.data;
        } catch (error) {
            console.error('❌ [API] Error creating follow-up:', error);
            throw error;
        }
    },

    async updateFollowUp(id, data) {
        try {
            const response = await fetch(`${CONFIG.API_URL}/follow-ups/${id}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify({ data })
            });
            if (!response.ok) throw new Error('فشل تحديث التقرير');
            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error updating follow-up:', error);
            throw error;
        }
    },

    async deleteFollowUp(id) {
        try {
            const response = await fetch(`${CONFIG.API_URL}/follow-ups/${id}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            if (!response.ok) throw new Error('فشل حذف التقرير');
            return true;
        } catch (error) {
            console.error('Error deleting follow-up:', error);
            throw error;
        }
    },

    // Tasks
    async getTasks() {
        console.log('🔄 [API] Starting getTasks request...');
        try {
            const url = `${CONFIG.API_URL}/tasks?populate[requireds]=true`;
            console.log('📡 [API] Fetching tasks from:', url);
            
            const response = await fetch(url, {
                headers: this.getHeaders()
            });
            
            console.log('📥 [API] Tasks response status:', response.status, response.statusText);
            

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ [API] Tasks fetch failed:', response.status, errorText);
                
                if (response.status === 403) {
                    throw new Error('⚠️ ليس لديك صلاحية الوصول للمهام. تحقق من إعدادات Strapi.');
                }
                throw new Error('فشل جلب المهام');
            }

            
            const result = await response.json();
            console.log('✅ [API] Tasks fetched successfully:', result.data?.length, 'tasks');
            console.log('📊 [API] Tasks data:', result.data);
            
            return result.data || [];
        } catch (error) {
            console.error('❌ [API] Error fetching tasks:', error);
            throw error;
        }
    },

    async getTask(id) {
        console.log('🔄 [API] Starting getTask request for ID:', id);
        try {
            const url = `${CONFIG.API_URL}/tasks/${id}?populate[requireds]=true`;
            console.log('📡 [API] Fetching task from:', url);
            
            const response = await fetch(url, {
                headers: this.getHeaders()
            });
            
            console.log('📥 [API] Task response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ [API] Task fetch failed:', errorText);
                throw new Error('فشل جلب المهمة');
            }
            
            const result = await response.json();
            console.log('✅ [API] Task fetched successfully:', result.data);
            
            return result.data;
        } catch (error) {
            console.error('❌ [API] Error fetching task:', error);
            throw error;
        }
    },

    async createTask(data) {
        console.log('🔄 [API] Starting createTask request...');
        console.log('📤 [API] Task data to send:', data);
        try {
            const response = await fetch(`${CONFIG.API_URL}/tasks`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ data })
            });
            
            console.log('📥 [API] Create task response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ [API] Task creation failed:', errorText);
                throw new Error('فشل إضافة المهمة');
            }
            
            const result = await response.json();
            console.log('✅ [API] Task created successfully:', result.data);
            
            return result.data;
        } catch (error) {
            console.error('❌ [API] Error creating task:', error);
            throw error;
        }
    },

    async updateTask(id, data) {
        try {
            const response = await fetch(`${CONFIG.API_URL}/tasks/${id}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify({ data })
            });
            if (!response.ok) throw new Error('فشل تحديث المهمة');
            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error updating task:', error);
            throw error;
        }
    },

    async deleteTask(id) {
        try {
            const response = await fetch(`${CONFIG.API_URL}/tasks/${id}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            if (!response.ok) throw new Error('فشل حذف المهمة');
            return true;
        } catch (error) {
            console.error('Error deleting task:', error);
            throw error;
        }
    },

    // Requireds
    async getRequireds() {
        console.log('🔄 [API] Starting getRequireds request...');
        try {
            const url = `${CONFIG.API_URL}/requireds?populate[task]=true`;
            console.log('📡 [API] Fetching requireds from:', url);
            
            const response = await fetch(url, {
                headers: this.getHeaders()
            });
            
            console.log('📥 [API] Requireds response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ [API] Requireds fetch failed:', errorText);
                
                if (response.status === 403) {
                    throw new Error('⚠️ ليس لديك صلاحية الوصول للمطلوبات. تحقق من إعدادات Strapi.');
                }
                throw new Error('فشل جلب المطلوبات');
            }

            
            const result = await response.json();
            console.log('✅ [API] Requireds fetched successfully:', result.data?.length, 'items');
            console.log('📊 [API] Requireds data:', result.data);
            
            return result.data || [];
        } catch (error) {
            console.error('❌ [API] Error fetching requireds:', error);
            throw error;
        }
    },

    async createRequired(data) {
        try {
            const response = await fetch(`${CONFIG.API_URL}/requireds`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ data })
            });
            if (!response.ok) throw new Error('فشل إضافة المطلوب');
            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error creating required:', error);
            throw error;
        }
    },

    async updateRequired(id, data) {
        console.log('🔄 [API] Starting updateRequired request for ID:', id);
        console.log('📤 [API] Required data to update:', data);
        try {
            const response = await fetch(`${CONFIG.API_URL}/requireds/${id}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify({ data })
            });
            
            console.log('📥 [API] Update required response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ [API] Required update failed:', errorText);
                throw new Error('فشل تحديث المطلوب');
            }
            
            const result = await response.json();
            console.log('✅ [API] Required updated successfully:', result.data);
            
            return result.data;
        } catch (error) {
            console.error('❌ [API] Error updating required:', error);
            throw error;
        }
    },

    async deleteRequired(id) {
        try {
            const response = await fetch(`${CONFIG.API_URL}/requireds/${id}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            if (!response.ok) throw new Error('فشل حذف المطلوب');
            return true;
        } catch (error) {
            console.error('Error deleting required:', error);
            throw error;
        }
    },

    // Media Upload
    async uploadMedia(files) {
        try {
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                formData.append('files', files[i]);
            }

            const response = await fetch(`${CONFIG.API_URL}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${APP_STATE.token}`
                },
                body: formData
            });

            if (!response.ok) throw new Error('فشل رفع الملفات');
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error uploading media:', error);
            throw error;
        }
    }
};