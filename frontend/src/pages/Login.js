import React from 'react';
import { Form, message } from 'antd';
import api from '../helpers/api';
import { useDispatch } from 'react-redux';
import { HideLoading, ShowLoading } from '../redux/alertsSlice';

function Login() {
  const dispatch = useDispatch();
  const onFinish = async (values) => {
    try {
      dispatch(ShowLoading());
      const response = await api.post('/auth/login', values);
      if (response.data) {
        localStorage.setItem('token', response.data.access_token);
        message.success('Login Successfully');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  return (
    <div className="row d-flex justify-content-start align-items-center">
      <div className="col-lg-4 col-md-6 col-12 p-5">
        <img src={process.env.PUBLIC_URL + '/images/logo.png'} alt="Logo" className="logo-main" />
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="Email" name="username">
            <input type="email" className="form-control" />
          </Form.Item>
          <Form.Item label="Password" name="password">
            <input type="password" className="form-control" />
          </Form.Item>
          <a href="/forgot-password" className="d-flex justify-content-end px-2 text-secondary">
            Forgot Password
          </a>
          <div className="d-grid gap-2 mt-5 pt-5">
            <button className="btn btn-secondary btn-lg" type="submit">
              Login
            </button>
          </div>
          <div className="d-flex justify-content-center pt-3">
            Don't have an account?
            <a href="/register" className="px-2 text-secondary">
              Register Here
            </a>
          </div>
        </Form>
      </div>
      <div
        className="col-lg-8 col-md-6"
        style={{
          backgroundImage: `url(${process.env.PUBLIC_URL + '/images/bg.jpeg'})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          opacity: 0.3,
          scale: 1.5,
          height: '100%',
        }}
      ></div>
    </div>
  );
}

export default Login;
