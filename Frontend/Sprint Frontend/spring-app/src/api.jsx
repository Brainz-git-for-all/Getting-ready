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

export const sprintService = {
    getAll: () => api.get('/sprints'),
    create: (sprintData) => api.post('/sprints', sprintData),
    update: (id, sprintData) => api.put(`/sprints/${id}`, sprintData),
    delete: (id) => api.delete(`/sprints/${id}`)
};

export const habitService = {
    getAll: (userId) => api.get(`/habits/user/${userId}`),
    create: (habitData) => api.post('/habits', habitData),
    delete: (id) => api.delete(`/habits/${id}`),

    getTodaysLog: (userId, date) => api.get(`/habits/log/user/${userId}?date=${date}`),

    // FIXED: Added 'date' to the parameters and the URL string
    saveTodaysLog: (userId, date, habitIds) => api.post(`/habits/log/user/${userId}?date=${date}`, habitIds)
};

export default api;