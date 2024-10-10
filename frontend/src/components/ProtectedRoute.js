import { message } from 'antd';
import api from '../helpers/api';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { HideLoading, ShowLoading } from '../redux/alertsSlice';
import { SetUser } from '../redux/usersSlice';
import DefaultLayout from './DefaultLayout';

function ProtectedRoute({ children }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.users);

  const navigate = useNavigate();
  const validateToken = async () => {
    try {
      dispatch(ShowLoading());
      const response = await api.get('/auth/me');
      dispatch(HideLoading());
      if (response.data) {
        dispatch(SetUser(response.data.user));
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        message.error(response.data.message);
        navigate('/login');
      }
    } catch (error) {
      dispatch(HideLoading());
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      message.error(error.message);
      navigate('/login');
    }
  };
  useEffect(() => {
    if (localStorage.getItem('token')) {
      validateToken();
    } else {
      navigate('/login');
    }
  }, []);

  return <>{user && <DefaultLayout>{children}</DefaultLayout>}</>;
}

export default ProtectedRoute;
