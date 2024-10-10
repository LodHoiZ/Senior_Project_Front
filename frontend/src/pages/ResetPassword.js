import React from 'react';
import { Form, message, Input } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import api from '../helpers/api';
import { HideLoading, ShowLoading } from '../redux/alertsSlice';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onFinish = async (values) => {
    try {
      dispatch(ShowLoading());
      const response = await api.put('/auth/reset-password/' + token, values);
      dispatch(HideLoading());
      if (response) {
        message.success('Reset password successful');
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
          <h1 className="register-heading">Reset Password</h1>

          <Form layout="vertical" onFinish={onFinish} className="register-form">
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
            <div className="text-center py-4">
              <button className="btn btn-primary w-100" type="submit">
                Submit
              </button>
            </div>
          </Form>
        </div>
      </div>
    </>
  );
}

export default ResetPassword;
