import dayjs from 'dayjs';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { message, Badge, Calendar, Modal, Divider, Breadcrumb, Form, Input } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../helpers/api';
import { useDispatch } from 'react-redux';
import { HideLoading, ShowLoading } from '../redux/alertsSlice';

const CalendarEvent = () => {
  const { TextArea } = Input;
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.users);
  const [formComment] = Form.useForm();
  const [formPrepare] = Form.useForm();
  const [formFeedback] = Form.useForm();
  const [month, setMonth] = useState(() => dayjs());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [comment, setComment] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [listData, setListData] = useState([]);

  const getEvents = async () => {
    try {
      dispatch(ShowLoading());
      const response = await api.get('/events');
      dispatch(HideLoading());
      if (response.data) {
        const rows = response.data.map((x) => ({
          type: 'success',
          content: x.name,
          date: dayjs(x.event_date).format('YYYY-MM-DD'),
          data: x,
        }));
        setListData(rows);
        setSelectedEvent(rows.find((x) => x.data.id === selectedEvent?.data.id));
        setComment(rows.find((x) => x.data.id === selectedEvent?.data.id)?.data.EventPrepare?.comment);
        setFeedback(rows.find((x) => x.data.id === selectedEvent?.data.id)?.data.EventFeedback?.feedback);
      } else {
        message.error(response.data);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const onPanelChange = (newValue) => {
    const dateSelected = dayjs(newValue);
    if (dateSelected.month() === dayjs().month() && dateSelected.year() === dayjs().year()) {
      setMonth(dayjs());
    } else {
      setMonth(dayjs(newValue).startOf('month'));
    }
  };

  const handleDateCellClick = (item) => {
    setSelectedEvent(item);
    setComment(item?.data.EventPrepare?.comment);
    setFeedback(item?.data.EventFeedback?.feedback);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedEvent(null);
    setComment(null);
  };

  const dateCellRender = (value) => {
    const data = listData.filter((x) => dayjs(x.date).format('YYYYMMDD') === dayjs(value).format('YYYYMMDD')) || [];
    return data.map((item) => (
      <div key={item.content} className={'px-1 rounded-2 border border-' + item.type}>
        <Badge status={item.type} text={item.content} onClick={() => handleDateCellClick(item)} />
      </div>
    ));
  };
  const cellRender = (current, info) => {
    if (info.type === 'date') return dateCellRender(current);
    return info.originNode;
  };

  const CustomHeader = ({ value, onChange, onTypeChange }) => {
    const start = 0;
    const end = 12;
    const monthOptions = [];

    const localeData = value.localeData();
    const months = localeData.months();

    for (let i = start; i < end; i++) {
      monthOptions.push(
        <option key={i} value={i} className="month-item">
          {months[i]}
        </option>
      );
    }

    const month = value.month();
    const year = value.year();
    const options = [];
    for (let i = year - 5; i < year + 5; i++) {
      options.push(
        <option key={i} value={i} className="year-item">
          {i}
        </option>
      );
    }

    return (
      <div className="p-2">
        <div className="d-flex justify-content-between mb-3">
          <button className="btn btn-outline-dark" onClick={() => (window.location.href = '/event')}>
            <i className="ri-list-check"></i> List Event View
          </button>
        </div>
        <div className="mb-3 row">
          <div className="col-lg-3 col-md-6 col-sm-6 col-12">
            <span className="me-3">Year: </span>
            <select
              value={year}
              onChange={(e) => {
                const newYear = parseInt(e.target.value, 10);
                const newValue = value.clone().year(newYear);
                onChange(newValue);
                const dateSelected = dayjs(newValue);
                if (dateSelected.month() === dayjs().month() && dateSelected.year() === dayjs().year()) {
                  setMonth(dayjs());
                } else {
                  setMonth(dayjs(newValue).startOf('month'));
                }
              }}
              className="border border-1 px-3 py-1 me-5 rounded-3"
            >
              {options}
            </select>
          </div>

          <div className="col-lg-3 col-md-6 col-sm-6 col-12 sm:mt-2">
            <span className="me-3">Month: </span>
            <select
              value={month}
              onChange={(e) => {
                const newMonth = parseInt(e.target.value, 10);
                const newValue = value.clone().month(newMonth);
                onChange(newValue);
              }}
              className="border border-1 px-3 py-1 rounded-3"
            >
              {monthOptions}
            </select>
          </div>
        </div>
        <div className="mb-3">
          <h1 className="text-center">
            {months[month]} {year}
          </h1>
        </div>
      </div>
    );
  };

  const saveFeedback = async (value) => {
    try {
      dispatch(ShowLoading());
      let response = await api.post('/events-document-feedback', { event_id: selectedEvent.data.id, ...value });
      if (response.data) {
        message.success('Feedback Success');
        formFeedback.resetFields();
        getEvents();
      } else {
        message.error(response.data.message);
      }
      dispatch(HideLoading());
    } catch (error) {
      message.error(error.message);
      dispatch(HideLoading());
    }
  };

  const saveComment = async (value) => {
    try {
      dispatch(ShowLoading());
      let response = await api.post('/events-document-comment-prepare', { event_id: selectedEvent.data.id, ...value });
      if (response.data) {
        message.success('Comment Success');
        formComment.resetFields();
        getEvents();
      } else {
        message.error(response.data.message);
      }
      dispatch(HideLoading());
    } catch (error) {
      message.error(error.message);
      dispatch(HideLoading());
    }
  };

  const savePrepare = async (value) => {
    try {
      if (!!value.prepare) {
        dispatch(ShowLoading());
        let response = await api.post('/events-document-prepare', { event_id: selectedEvent.data.id, ...value });
        if (response.data) {
          message.success('Add List Successfully');
          formPrepare.resetFields();
          getEvents();
        } else {
          message.error(response.data.message);
        }
        dispatch(HideLoading());
      }
    } catch (error) {
      message.error(error.message);
      dispatch(HideLoading());
    }
  };

  const deletePrepare = async (id) => {
    Modal.confirm({
      title: 'Confirm delete?',
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
      let response = await api.delete('/events-document-prepare/' + id);
      if (response) {
        message.success('Delete List Successfully');
        formPrepare.resetFields();
        getEvents();
      } else {
        message.error(response.data.message);
      }
      dispatch(HideLoading());
    } catch (error) {
      message.error(error.message);
      dispatch(HideLoading());
    }
  };

  useEffect(() => {
    getEvents();
  }, []);

  useEffect(() => {
    formComment.setFieldsValue({ comment: comment });
  }, [comment]);

  useEffect(() => {
    formFeedback.setFieldsValue({ feedback: feedback });
  }, [feedback]);

  return (
    <>
      <div className="px-3">
        <Breadcrumb
          items={[
            { title: <a href="/">Home</a> },
            {
              title: 'Event Calendar',
            },
          ]}
        />
      </div>
      {listData && (
        <div className="mx-5 px-5">
          <div className="p-2 pb-0">
            <h1 style={{ textAlign: 'center', color: '#555' }}>Event Calendar</h1>
          </div>
          <Divider />
          <Calendar
            value={month}
            onPanelChange={onPanelChange}
            cellRender={cellRender}
            headerRender={({ value, type, onChange, onTypeChange }) => <CustomHeader value={value} onChange={onChange} onTypeChange={onTypeChange} />}
            className="border border-2 rounded-3 p-3 m-auto custom-calendar-panel"
          />
          <Modal
            title={`${selectedEvent ? dayjs(selectedEvent.date).format('MMMM DD') : ''} : ${selectedEvent?.content ?? ''}`}
            visible={isModalVisible}
            onCancel={handleModalClose}
            footer={null}
            centered
            width={800}
          >
            {user?.role === 'association' && selectedEvent && (
              <>
                <div className="row">
                  <div className="col-6">
                    <div className="border border-gray rounded-3 p-2">
                      To Prepare :
                      <Form layout="vertical" onFinish={savePrepare} form={formPrepare}>
                        <div className="row pt-2">
                          <div className="col-9">
                            <Form.Item name="prepare">
                              <Input placeholder="Enter prepare" />
                            </Form.Item>
                          </div>
                          <div className="col-3">
                            <button className="btn btn-outline-success btn-sm" type="submit">
                              <PlusOutlined />
                            </button>
                          </div>
                        </div>
                      </Form>
                      {selectedEvent.data.EventPrepare &&
                        selectedEvent.data.EventPrepare.Prepares?.map((item, index) => {
                          return (
                            <div className="row pt-2">
                              <div className="col-9">- {item.prepare}</div>
                              <div className="col-3">
                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => {
                                    deletePrepare(item.id);
                                  }}
                                >
                                  <DeleteOutlined />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="border border-gray rounded-3 p-2">
                      Comment :<pre className="p-2">{comment}</pre>
                      {selectedEvent.data.EventPrepare && (
                        <Form layout="vertical" onFinish={saveComment} form={formComment}>
                          <Form.Item name="comment">
                            <TextArea
                              showCount
                              maxLength={100}
                              style={{
                                height: 120,
                                resize: 'none',
                              }}
                              placeholder="Enter comment"
                            />
                          </Form.Item>
                          <div className="pt-1 text-center">
                            <button className="btn btn-primary" type="submit">
                              comment
                            </button>
                          </div>
                        </Form>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
            {user?.role === 'council' && selectedEvent && (
              <>
                <div className="">
                  Feedback :<pre className="p-2">{feedback}</pre>
                  {selectedEvent.data.EventPrepare && (
                    <Form layout="vertical" onFinish={saveFeedback} form={formFeedback}>
                      <Form.Item name="feedback">
                        <TextArea
                          showCount
                          maxLength={200}
                          style={{
                            height: 120,
                            resize: 'none',
                          }}
                          placeholder="Enter Feedback"
                        />
                      </Form.Item>
                      <div className="pt-1 text-center">
                        <button className="btn btn-primary" type="submit">
                          Feedback
                        </button>
                      </div>
                    </Form>
                  )}
                </div>
              </>
            )}
          </Modal>
        </div>
      )}
    </>
  );
};

export default CalendarEvent;
