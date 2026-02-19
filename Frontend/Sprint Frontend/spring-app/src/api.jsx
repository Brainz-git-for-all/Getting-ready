import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    withCredentials: true // Required for HttpOnly Cookies
});

export const authService = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    logout: () => api.post('/auth/logout')
};

export const sprintService = {
    getAll: () => api.get('/sprints'),
    create: (data) => api.post('/sprints', data),
    delete: (id) => api.delete(`/sprints/${id}`),
    addTask: (sprintId, task) => api.post(`/sprints/${sprintId}/tasks`, task)
};

export default api;