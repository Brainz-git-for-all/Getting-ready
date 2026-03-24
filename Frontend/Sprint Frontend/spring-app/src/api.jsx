import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    withCredentials: true,
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // FIXED: Prevent infinite loops!
        // If the 401 comes FROM the refresh or login endpoint, do NOT try to refresh again.
        if (originalRequest.url.includes('/auth/refresh') || originalRequest.url.includes('/auth/login')) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // Attempt to refresh the token
                await api.post('/auth/refresh');

                // If successful, retry the original request
                return api(originalRequest);
            } catch (refreshError) {
                // If the refresh fails (e.g., refresh token expired), clear local storage and force login
                localStorage.clear();
                window.location.href = '/';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

// ... keep your authService, habitService, sprintService, etc. below exactly as they are ...

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
    update: (id, sprintData) => api.put(`/sprints/${id}`, sprintData), // <-- ADDED
    delete: (id) => api.delete(`/sprints/${id}`),
    addTask: (sprintId, taskData) => api.post(`/sprints/${sprintId}/tasks`, taskData), // <-- ADDED
    deleteTask: (sprintId, taskId) => api.delete(`/sprints/${sprintId}/tasks/${taskId}`), // <-- ADDED
    toggleTaskCompletion: (sprintId, taskId, completed) =>
        api.patch(`/sprints/${sprintId}/tasks/${taskId}/complete?completed=${completed}`)
};

// ... existing authService, habitService, sprintService ...

export const linkService = {
    getAllByUser: (userId) => api.get(`/links/user/${userId}`),
    create: (linkData) => api.post('/links', linkData),
    update: (id, linkData) => api.put(`/links/${id}`, linkData),
    delete: (id) => api.delete(`/links/${id}`),
};

// Add this alongside your existing services in api.js

export const reminderService = {
    getAllByUser: (userId) => api.get(`/users/${userId}/reminders`),
    create: (userId, reminderData) => api.post(`/users/${userId}/reminders`, reminderData),
    update: (userId, id, reminderData) => api.put(`/users/${userId}/reminders/${id}`, reminderData),
    delete: (userId, id) => api.delete(`/users/${userId}/reminders/${id}`),
};

export default api;