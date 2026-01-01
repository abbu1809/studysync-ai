import apiClient from './api';

export const authService = {
  register: async (userData) => {
    return await apiClient.post('/auth/register', userData);
  },

  verifyToken: async (token) => {
    return await apiClient.post('/auth/verify', { token });
  }
};

export const userService = {
  getProfile: async () => {
    return await apiClient.get('/users/profile');
  },

  updateProfile: async (data) => {
    return await apiClient.put('/users/profile', data);
  },

  updatePreferences: async (preferences) => {
    return await apiClient.put('/users/preferences', preferences);
  },

  getStats: async () => {
    return await apiClient.get('/users/stats');
  },

  deleteAccount: async () => {
    return await apiClient.delete('/users/account');
  }
};

export const documentService = {
  upload: async (file, metadata) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', metadata.title);
    formData.append('type', metadata.type);

    return await apiClient.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  getAll: async (params = {}) => {
    return await apiClient.get('/documents', { params });
  },

  getById: async (documentId) => {
    return await apiClient.get(`/documents/${documentId}`);
  },

  delete: async (documentId) => {
    return await apiClient.delete(`/documents/${documentId}`);
  },

  reprocess: async (documentId) => {
    return await apiClient.post(`/documents/${documentId}/reprocess`);
  }
};

export const assignmentService = {
  getAll: async (params = {}) => {
    return await apiClient.get('/assignments', { params });
  },

  getById: async (assignmentId) => {
    return await apiClient.get(`/assignments/${assignmentId}`);
  },

  create: async (data) => {
    return await apiClient.post('/assignments', data);
  },

  update: async (assignmentId, data) => {
    return await apiClient.put(`/assignments/${assignmentId}`, data);
  },

  updateStatus: async (assignmentId, status, actualHours, completionNotes) => {
    return await apiClient.patch(`/assignments/${assignmentId}/status`, {
      status,
      actualHours,
      completionNotes
    });
  },

  delete: async (assignmentId) => {
    return await apiClient.delete(`/assignments/${assignmentId}`);
  }
};

export const studyPlanService = {
  generate: async (data) => {
    return await apiClient.post('/study-plans/generate', data);
  },

  getAll: async (params = {}) => {
    return await apiClient.get('/study-plans', { params });
  },

  getById: async (planId) => {
    return await apiClient.get(`/study-plans/${planId}`);
  },

  updateSession: async (planId, sessionId, data) => {
    return await apiClient.patch(`/study-plans/${planId}/sessions/${sessionId}`, data);
  },

  rebalance: async (planId) => {
    return await apiClient.post(`/study-plans/${planId}/rebalance`);
  },

  delete: async (planId) => {
    return await apiClient.delete(`/study-plans/${planId}`);
  }
};

export const chatService = {
  sendMessage: async (data) => {
    return await apiClient.post('/chat/message', data);
  },

  getConversations: async () => {
    return await apiClient.get('/chat/conversations');
  },

  getConversation: async (conversationId) => {
    return await apiClient.get(`/chat/conversations/${conversationId}`);
  },

  deleteConversation: async (conversationId) => {
    return await apiClient.delete(`/chat/conversations/${conversationId}`);
  }
};

export const vivaService = {
  generate: async (data) => {
    return await apiClient.post('/viva/generate', data);
  },

  submit: async (data) => {
    return await apiClient.post('/viva/submit', data);
  },

  getResults: async (params = {}) => {
    return await apiClient.get('/viva/results', { params });
  },

  getAll: async (params = {}) => {
    return await apiClient.get('/viva', { params });
  },

  submitAnswer: async (questionId, userAnswer) => {
    return await apiClient.post(`/viva/${questionId}/answer`, { userAnswer });
  },

  delete: async (questionId) => {
    return await apiClient.delete(`/viva/${questionId}`);
  }
};

export const resourceService = {
  getRecommendations: async (subject, topic) => {
    return await apiClient.get('/resources/recommendations', {
      params: { subject, topic }
    });
  },

  markAsViewed: async (resourceId) => {
    return await apiClient.post(`/resources/${resourceId}/view`);
  },

  submitFeedback: async (resourceId, helpful) => {
    return await apiClient.post(`/resources/${resourceId}/feedback`, { helpful });
  }
};

export const habitService = {
  create: async (data) => {
    return await apiClient.post('/habits', data);
  },

  getAll: async (params = {}) => {
    return await apiClient.get('/habits', { params });
  },

  update: async (habitId, data) => {
    return await apiClient.put(`/habits/${habitId}`, data);
  },

  delete: async (habitId) => {
    return await apiClient.delete(`/habits/${habitId}`);
  },

  complete: async (habitId, data) => {
    return await apiClient.post(`/habits/${habitId}/complete`, data);
  },

  uncomplete: async (habitId, data) => {
    return await apiClient.post(`/habits/${habitId}/uncomplete`, data);
  },

  logSession: async (data) => {
    return await apiClient.post('/habits/sessions', data);
  },

  getSessions: async (params = {}) => {
    return await apiClient.get('/habits/sessions', { params });
  },

  analyze: async () => {
    return await apiClient.post('/habits/analyze');
  },

  getInsights: async () => {
    return await apiClient.get('/habits/insights');
  }
};

export const analyticsService = {
  getAnalytics: async (period = 'month') => {
    return await apiClient.get(`/analytics?period=${period}`);
  }
};
