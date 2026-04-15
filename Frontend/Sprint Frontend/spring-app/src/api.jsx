import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    withCredentials: true,
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (originalRequest.url.includes('/auth/refresh') || originalRequest.url.includes('/auth/login')) {
            return Promise.reject(error);
        }
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                await api.post('/auth/refresh');
                return api(originalRequest);
            } catch (refreshError) {
                localStorage.clear();
                window.location.href = '/';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export const authService = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    logout: () => api.post('/auth/logout'),
};

export const habitService = {
    getAll: (userId) => api.get(`/habits/user/${userId}`),
    create: (habitData) => api.post('/habits', habitData),
    update: (id, habitData) => api.put(`/habits/${id}`, habitData),
    delete: (id) => api.delete(`/habits/${id}`),
    getTodaysLog: (userId, date) => api.get(`/habits/log/user/${userId}?date=${date}`),
    saveTodaysLog: (userId, date, habitIds) => api.post(`/habits/log/user/${userId}?date=${date}`, habitIds),
    getAllLogs: (userId) => api.get(`/habits/logs/user/${userId}`)
};

export const sprintService = {
    getAllByUser: (userId) => api.get(`/sprints/user/${userId}`),
    create: (sprintData) => api.post('/sprints', sprintData),
    update: (id, sprintData) => api.put(`/sprints/${id}`, sprintData),
    delete: (id) => api.delete(`/sprints/${id}`),
    addTask: (sprintId, taskData) => api.post(`/sprints/${sprintId}/tasks`, taskData),
    deleteTask: (sprintId, taskId) => api.delete(`/sprints/${sprintId}/tasks/${taskId}`),
    toggleTaskCompletion: (sprintId, taskId, completed) =>
        api.patch(`/sprints/${sprintId}/tasks/${taskId}/complete?completed=${completed}`)
};

export const scheduleBlockService = {
    getByUserAndDay: (userId, day) => {
        if (day === 'ALL') return api.get(`/schedule-blocks/user/${userId}/all`);
        return api.get(`/schedule-blocks/user/${userId}/day/${day}`);
    },
    create: (blockData) => api.post('/schedule-blocks', blockData),
    update: (id, blockData) => api.put(`/schedule-blocks/${id}`, blockData),
    delete: (id) => api.delete(`/schedule-blocks/${id}`),
};

export const categoryService = {
    getAllByUser: (userId) => api.get(`/categories/user/${userId}`),
    create: (categoryData) => api.post('/categories', categoryData),
    update: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
    delete: (id) => api.delete(`/categories/${id}`)
};

export const proxyService = {
    getSites: (userId) => api.get(`/proxy/sites/${userId}`),
    addSite: (siteData) => api.post(`/proxy/sites`, siteData),
    deleteSite: (id) => api.delete(`/proxy/sites/${id}`),
    startFocus: (userId) => api.post(`/proxy/start/${userId}`),
    stopFocus: (userId) => api.post(`/proxy/stop/${userId}`),
    getPacUrl: (userId) => `${api.defaults.baseURL}/proxy/pac/${userId}`
};

export const quickTaskService = {
    getAllByUser: (userId) => api.get(`/quick-tasks/user/${userId}`),
    create: (taskData) => api.post('/quick-tasks', taskData),
    update: (id, taskData) => api.put(`/quick-tasks/${id}`, taskData),
    delete: (id) => api.delete(`/quick-tasks/${id}`)
};

export default api;