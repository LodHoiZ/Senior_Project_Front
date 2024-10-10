import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { message, Table, Modal, Form, Input, DatePicker, Divider, Breadcrumb } from 'antd';
import api from '../helpers/api';
import { useDispatch } from 'react-redux';
import { HideLoading, ShowLoading } from '../redux/alertsSlice';

const Event = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { user } = useSelector((state) => state.users);
  const [events, setEvents] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [year, setYear] = useState(dayjs().format('YYYY'));
  const [month, setMonth] = useState(Number(dayjs().format('MM')) - 1);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });

  const getEvents = async (q = null) => {
    try {
      dispatch(ShowLoading());
      const response = await api.get('/events' + (q ? `?year=${q.year}&month=${q.month}` : ''));
      dispatch(HideLoading());
      if (response.data) {
        const rows = response.data.map((x, i) => ({ ...x, no: i + 1, year_month: `${x.year}/${x.month}`, username: `${x.User?.firstname ?? '-'}` }));
        setEvents(rows);
        setTableParams({
          ...tableParams,
          pagination: {
            ...tableParams.pagination,
            total: rows.length,
          },
        });
      } else {
        message.error(response.data);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const onFinish = async (values) => {
    try {
      dispatch(ShowLoading());
      const params = {
        ...values,
        year: dayjs(values.year).format('YYYY'),
        month: dayjs(values.year).format('MM'),
        event_date: dayjs(values.year).format('YYYY-MM-DD'),
      };
      let response = await api.post('/events', params);
      if (response.data) {
        message.success('Create Event Success');
        getEvents();
        handleModalClose();
      } else {
        message.error(response.data.message);
      }

      dispatch(HideLoading());
    } catch (error) {
      message.error(error.message);
      dispatch(HideLoading());
    }
  };

  const search = () => {
    getEvents({ year, month: Number(month) + 1 });
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const getYear = () => {
    const year = dayjs().format('YYYY');
    const options = [];
    for (let i = Number(year) - 5; i < Number(year) + 5; i++) {
      options.push(
        <option key={i} value={i} className="year-item">
          {i}
        </option>
      );
    }
    return options;
  };

  const getMonth = () => {
    const start = 0;
    const end = 12;
    const monthOptions = [];
    const monthsFull = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    for (let i = start; i < end; i++) {
      monthOptions.push(
        <option key={i} value={i} className="month-item">
          {monthsFull[i]}
        </option>
      );
    }
    return monthOptions;
  };

  const showDeleteModal = (id) => {
    Modal.confirm({
      title: 'Confirm delete event?',
      onOk: () => {
        handleConfirmDelete(id);
      },
      footer: (_, { OkBtn, CancelBtn }) => (
        <>
          <CancelBtn />
          <OkBtn />
        </>
      ),
    });
  };
  const handleConfirmDelete = async (id) => {
    try {
      dispatch(ShowLoading());
      const response = await api.delete('/events/' + id);
      dispatch(HideLoading());
      if (response) {
        getEvents();
      } else {
        message.error(response.data);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const dateFormat = 'DD/MM/YYYY';
  const columns = [
    {
      title: 'No.',
      dataIndex: 'no',
      align: 'center',
    },
    {
      title: 'Term',
      dataIndex: 'term',
      align: 'center',
    },
    {
      title: 'Year',
      dataIndex: 'year_month',
      align: 'center',
    },
    {
      title: 'Event Code',
      dataIndex: 'code',
      align: 'center',
    },
    {
      title: 'Event Name',
      dataIndex: 'name',
      align: 'center',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      align: 'center',
    },
    {
      title: 'Recorder',
      dataIndex: 'username',
      align: 'center',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      align: 'center',
      render: (action, record) => (
        <div className="d-flex gap-3 justify-content-center">
          {user?.role === 'council' && (
            <i
              className="ri-eye-line text-info"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                window.location.href = '/document/' + record.id;
              }}
            ></i>
          )}
          {user?.role === 'association' && (
            <>
              <i
                className="ri-edit-2-fill text-warning"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  window.location.href = '/document/' + record.id;
                }}
              ></i>
              <i
                className="ri-delete-bin-2-fill text-danger"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  showDeleteModal(record.id);
                }}
              ></i>
            </>
          )}
        </div>
      ),
    },
  ];

  useEffect(() => {
    getEvents();
  }, []);

  return (
    <>
      <div className="px-3">
        <Breadcrumb
          items={[
            { title: <a href="/">Home</a> },
            {
              title: 'List of Events',
            },
          ]}
        />
      </div>
      <div className="mx-5 px-5">
        <div className="p-2 pb-0">
          <h1 style={{ textAlign: 'center', color: '#555' }}>List of Events</h1>
        </div>
        <Divider />
        <div className="d-flex justify-content-between mb-3">
          <button className="btn btn-outline-dark" onClick={() => (window.location.href = '/calendar')}>
            <i className="ri-calendar-check-line"></i> Calendar View
          </button>
          {user?.role === 'association' && (
            <button className="btn btn-primary" onClick={() => setIsModalVisible(true)}>
              <i className="ri-add-line"></i> Add Event
            </button>
          )}
        </div>
        <div className="border border-2 rounded-3 p-3">
          <div className="px-3 pb-3">
            <div className="row">
              <div className="col-xxl-6 col-xl-8 col-lg-9 col-md-12 col-12 mt-2">
                <span className="me-3">Year: </span>
                <select
                  value={year}
                  onChange={(e) => {
                    setYear(e.target.value);
                  }}
                  className="border border-1 px-3 py-1 me-5 rounded-3"
                >
                  {getYear()}
                </select>
                <span className="me-3">Month: </span>
                <select
                  value={month}
                  onChange={(e) => {
                    setMonth(e.target.value);
                  }}
                  className="border border-1 px-3 py-1 rounded-3"
                >
                  {getMonth()}
                </select>
              </div>
              <div className="d-grid col-xxl-3 col-xl-3 col-lg-3 col-md-12 col-12 mt-2">
                <button className="btn btn-info" onClick={() => search()}>
                  Search
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 px-3 pb-3">
            <Table columns={columns} dataSource={events} pagination={tableParams.pagination} />
          </div>
        </div>

        <Modal title={`Add Event`} visible={isModalVisible} onCancel={handleModalClose} footer={null}>
          <Form className="pt-3" layout="vertical" form={form} onFinish={onFinish} autoComplete="off">
            <Form.Item
              label="Year-Month"
              name="year"
              rules={[
                {
                  required: true,
                  message: 'Please input your Year-Month!',
                },
              ]}
            >
              <DatePicker format={dateFormat} className="w-100" />
            </Form.Item>
            <Form.Item
              label="Term"
              name="term"
              type="number"
              rules={[
                {
                  required: true,
                  message: 'Please input Term!',
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Name"
              name="name"
              rules={[
                {
                  required: true,
                  message: 'Please input your Name!',
                },
              ]}
            >
              <Input />
            </Form.Item>
            <div className="d-grid gap-2 mt-5">
              <button className="btn btn-success" type="submit">
                Save
              </button>
            </div>
          </Form>
        </Modal>
      </div>
    </>
  );
};

export default Event;
