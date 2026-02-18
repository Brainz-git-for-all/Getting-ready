import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

export const sprintService = {
    getAll: () => api.get('/sprints'),
    getById: (id) => api.get(`/sprints/${id}`),
    create: (data) => api.post('/sprints', data),
    update: (id, data) => api.put(`/sprints/${id}`, data),
    delete: (id) => api.delete(`/sprints/${id}`),

    // Task specific endpoints
    addTask: (sprintId, task) => api.post(`/sprints/${sprintId}/tasks`, task),
    deleteTask: (sprintId, taskId) => api.delete(`/sprints/${sprintId}/tasks/${taskId}`)
};

export default api;