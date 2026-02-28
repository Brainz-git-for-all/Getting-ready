import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    withCredentials: true,
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (originalRequest.url.includes('/auth/refresh')) {
                localStorage.clear();
                window.location.href = '/';
                return Promise.reject(error);
            }
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

// Add this inside the sprintService object in api.js
export const sprintService = {
    getAll: () => api.get('/sprints'),
    getAllByUser: (userId) => api.get(`/sprints/user/${userId}`),
    create: (sprintData) => api.post('/sprints', sprintData),
    update: (id, sprintData) => api.put(`/sprints/${id}`, sprintData),
    delete: (id) => api.delete(`/sprints/${id}`),

    addTask: (sprintId, taskData) => api.post(`/sprints/${sprintId}/tasks`, taskData),
    deleteTask: (sprintId, taskId) => api.delete(`/sprints/${sprintId}/tasks/${taskId}`),

    // <--- NEW: Toggle task completion
    toggleTaskCompletion: (sprintId, taskId, completed) =>
        api.patch(`/sprints/${sprintId}/tasks/${taskId}/complete?completed=${completed}`)
};

// Add this inside the habitService object in api.js
export const habitService = {
    getAll: (userId) => api.get(`/habits/user/${userId}`),
    create: (habitData) => api.post('/habits', habitData),
    delete: (id) => api.delete(`/habits/${id}`),
    getTodaysLog: (userId, date) => api.get(`/habits/log/user/${userId}?date=${date}`),
    saveTodaysLog: (userId, date, habitIds) => api.post(`/habits/log/user/${userId}?date=${date}`, habitIds),

    // <--- NEW: Get all historical logs for visualisations
    getAllLogs: (userId) => api.get(`/habits/logs/user/${userId}`)
};

export default api;