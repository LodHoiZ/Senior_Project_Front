import React from 'react';
import { Form, message, Input } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import api from '../helpers/api';
import { useDispatch } from 'react-redux';
import { ShowLoading, HideLoading } from '../redux/alertsSlice';
import './Register.css';

function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const onFinish = async (values) => {
    try {
      dispatch(ShowLoading());
      const response = await api.post('/auth/forgot-password', values);
      dispatch(HideLoading());
      if (response) {
        message.success('Send link to email successful');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.response.data.message);
    }
  };

  return (
    <>
      <div className="register-container">
        <div className="register-form-container">
          <h1 className="register-heading">Forgot Password</h1>

          <Form layout="vertical" onFinish={onFinish} className="register-form">
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  message: 'Please input your Email!',
                },
                {
                  type: 'email',
                  message: 'The input is not valid E-mail!',
                },
              ]}
            >
              <Input />
            </Form.Item>
            <div className="text-center pt-2 pb-4">
              <button className="btn btn-primary w-100" type="submit">
                Send
              </button>
            </div>
            <div className="text-center">
              <Link to="/login" className="text-secondary">
                Back to Login Page
              </Link>
            </div>
          </Form>
        </div>
      </div>
    </>
  );
}

export default Register;
