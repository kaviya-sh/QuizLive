import client from './client';

export const mediaApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return client.post<{ url: string }>('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
