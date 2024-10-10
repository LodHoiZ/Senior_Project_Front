import React from 'react';
import { Form, message, Input, Radio } from 'antd';
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
      const response = await api.post('/auth/register', values);
      dispatch(HideLoading());
      if (response) {
        message.success('Register successfully');
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
          <h1 className="register-heading">Register</h1>

          <Form layout="vertical" onFinish={onFinish} className="register-form">
            <Form.Item
              label="First Name"
              name="firstname"
              rules={[
                {
                  required: true,
                  message: 'Please input your first name!',
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Last Name"
              name="lastname"
              rules={[
                {
                  required: true,
                  message: 'Please input your last name!',
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  message: 'Please input your email!',
                },
                {
                  type: 'email',
                  message: 'The input is not valid email!',
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Password"
              name="password"
              rules={[
                {
                  required: true,
                  message: 'Please input password!',
                },
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              label="Confirm Password"
              name="confirm"
              rules={[
                {
                  required: true,
                  message: 'Please input confirm password!',
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Confirm password not match!'));
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item name="role" label="Role">
              <Radio.Group>
                <Radio value="council">Student Council</Radio>
                <Radio value="association">Student Association</Radio>
              </Radio.Group>
            </Form.Item>

            <div className="text-center py-4">
              <button className="btn btn-info w-100" type="submit">
                Register
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
