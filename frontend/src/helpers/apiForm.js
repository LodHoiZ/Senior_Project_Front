import axios from 'axios';

const apiForm = axios.create({
  baseURL: `http://localhost:5000/api/v1/`,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

apiForm.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('token'); // get stored access token
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`; // set in header
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
export default apiForm;
