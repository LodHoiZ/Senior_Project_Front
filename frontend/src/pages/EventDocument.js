import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { InfoCircleOutlined, UploadOutlined } from '@ant-design/icons';
import { Divider, Breadcrumb, Tabs, Form, Input, message, Upload, Tooltip, Badge } from 'antd';
import { useDispatch } from 'react-redux';
import { HideLoading, ShowLoading } from '../redux/alertsSlice';
import api from '../helpers/api';
import apiForm from '../helpers/apiForm';
import { Document, Page, pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

const { TextArea } = Input;
const list = [
  { index: 1, file: [], status: 'revising', comments: [{ text: '312321' }], text: 'Event Proposal Document' },
  { index: 2, file: [], status: 'revising', comments: [], text: 'บนศ.1' },
  { index: 3, file: [], status: 'revising', comments: [], text: 'Advanced Payment' },
  { index: 4, file: [], status: 'revising', comments: [], text: 'บนศ.2' },
  { index: 5, file: [], status: 'revising', comments: [], text: 'Participants' },
  { index: 6, file: [], status: 'revising', comments: [], text: 'Documents' },
  { index: 7, file: [], status: 'revising', comments: [], text: 'Financial Documents' },
];

const EventDocument = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [formComment] = Form.useForm();
  const { user } = useSelector((state) => state.users);
  const [previewFile, setPreviewFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [listDoc, setListDoc] = useState(list);
  const [currentTab, setCurrentTab] = useState(1);

  const getEvent = async () => {
    try {
      dispatch(ShowLoading());
      const response = await api.get('/events/' + id);
      dispatch(HideLoading());
      if (response.data) {
        const listDocs = [];
        for (const document of listDoc) {
          const doc = response.data.EventDocuments.find((x) => x.name === document.text);
          const comment = response.data.EventComments.filter((x) => x.name === document.text);
          listDocs.push({
            ...document,
            file: doc ? doc : [],
            comments: comment ? comment : [],
            status: doc ? doc.status : '-',
          });
        }
        setListDoc(listDocs);
      } else {
        message.error(response.data);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const saveFile = async (value) => {
    try {
      const formData = new FormData();
      formData.append('file', listDoc[currentTab - 1].file[0]?.originFileObj);
      formData.append('name', listDoc[currentTab - 1].text);
      dispatch(ShowLoading());
      let response = await apiForm.put('/events-document/' + id, formData);
      if (response.data) {
        message.success('Uploaded File Success');
        getEvent();
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
      let response = await api.put('/events-document-comment/' + id, { ...value, name: listDoc[currentTab - 1].text });
      if (response.data) {
        message.success('Comment Success');
        formComment.resetFields();
        getEvent();
      } else {
        message.error(response.data.message);
      }
      dispatch(HideLoading());
    } catch (error) {
      message.error(error.message);
      dispatch(HideLoading());
    }
  };

  const rejectedDoc = async (name) => {
    try {
      dispatch(ShowLoading());
      let response = await api.put('/events-document-status/' + id, { status: 'rejected', name });
      if (response.data) {
        message.success('Update Status Success');
        getEvent();
      } else {
        message.error(response.data.message);
      }
      dispatch(HideLoading());
    } catch (error) {
      message.error(error.message);
      dispatch(HideLoading());
    }
  };

  const completedDoc = async (name) => {
    try {
      dispatch(ShowLoading());
      let response = await api.put('/events-document-status/' + id, { status: 'completed', name });
      if (response.data) {
        message.success('Update Status Success');
        getEvent();
      } else {
        message.error(response.data.message);
      }
      dispatch(HideLoading());
    } catch (error) {
      message.error(error.message);
      dispatch(HideLoading());
    }
  };

  const handlePreview = async (file) => {
    setPreviewFile(file.originFileObj);
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const onChangeTab = (e) => {
    setCurrentTab(e);
    if (listDoc[e - 1]?.file[0]?.originFileObj) {
      setPreviewFile(listDoc[e - 1]?.file[0]?.originFileObj);
    } else {
      setPreviewFile(null);
    }
  };

  const uploadButton = (
    <div>
      <UploadOutlined />
      <div
        style={{
          marginTop: 8,
        }}
      >
        Upload file
      </div>
    </div>
  );

  const upload = (f, status, index) => {
    return (
      <>
        {status !== 'completed' && (
          <Upload
            listType="picture-card"
            fileList={f?.url ? [] : f}
            onChange={({ fileList: newFileList }) => {
              if (newFileList.length > 0) {
                setPreviewFile(newFileList[0]?.originFileObj);
              } else {
                setPreviewFile(null);
              }
              newFileList = newFileList.map((x) => ({ ...x, status: 'done' }));
              const list = listDoc.map((x, i) => ({ ...x, file: index === i ? newFileList : x.file }));
              setListDoc([...list]);
            }}
            onPreview={handlePreview}
            onRemove={(file) => {
              const list = listDoc.map((x, i) => ({ ...x, file: index === i ? [] : x.file }));
              setListDoc(list);
              if (previewFile === file.originFileObj) {
                setPreviewFile(null);
                setNumPages(null);
              }
            }}
            accept="application/pdf"
            beforeUpload={() => false}
          >
            {f.length >= 1 ? null : uploadButton}
          </Upload>
        )}

        {(f?.url || previewFile) && (
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                height: '700px',
                overflow: 'auto',
                border: '1px solid #ddd',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: '#f0f0f0',
              }}
            >
              <Document
                file={f?.url ? `http://localhost:5000/uploads/${f.url}` : URL.createObjectURL(previewFile)}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={console.error}
              >
                {Array.from(new Array(numPages), (el, index) => (
                  <div key={`page_${index + 1}`} style={{ marginBottom: '16px' }}>
                    <Page pageNumber={index + 1} renderMode="canvas" renderTextLayer={false} renderAnnotationLayer={false} />
                  </div>
                ))}
              </Document>
            </div>
          </div>
        )}
      </>
    );
  };

  const docReview = (docType) => {
    return (
      <div className="container">
        <span className="fs-4">
          {docType.text}{' '}
          {docType.status !== '-' && (
            <Badge count={docType.status} color={docType.status === 'revising' ? '#faad14' : docType.status === 'rejected' ? '#f5222d' : '#52c41a'} />
          )}
        </span>

        {docType.file?.url || docType.file[0]?.originFileObj ? (
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                height: '700px',
                overflow: 'auto',
                border: '1px solid #ddd',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: '#f0f0f0',
              }}
            >
              <Document
                file={docType.file?.url ? `http://localhost:5000/uploads/${docType.file?.url}` : docType.file[0]?.originFileObj}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={console.error}
              >
                {Array.from(new Array(numPages), (el, index) => (
                  <div key={`page_${index + 1}`} style={{ marginBottom: '16px' }}>
                    <Page pageNumber={index + 1} renderMode="canvas" renderTextLayer={false} renderAnnotationLayer={false} />
                  </div>
                ))}
              </Document>
            </div>
          </div>
        ) : (
          <p className="fs-6 text-danger">No File Uploaded!</p>
        )}
        {(docType.file?.url || docType.file[0]?.originFileObj) && (
          <>
            <div className="mt-5">
              {docType.status !== 'completed' && (
                <div className="d-flex justify-content-center">
                  <button
                    className="btn btn-warning mx-4 w-25"
                    onClick={() => {
                      rejectedDoc(docType.text);
                    }}
                  >
                    Reject
                  </button>
                  <button
                    className="btn btn-success w-25"
                    onClick={() => {
                      completedDoc(docType.text);
                    }}
                  >
                    Approve
                  </button>
                </div>
              )}

              {docType.comments.length > 0 && (
                <>
                  <Divider />
                  <span>Feedback</span>
                </>
              )}
              {docType.comments?.map((item, index) => {
                return (
                  <div className="card my-1">
                    <div className="card-body">
                      <span>{item.comment}</span>
                      <small className="d-flex justify-content-end text-secondary">
                        {item.User?.firstname} ( {dayjs(item.created_at).format('DD/MM/YYYY')} )
                      </small>
                    </div>
                  </div>
                );
              })}
            </div>
            <Divider />
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
              <div className="pt-1 pb-5 text-center">
                <button className="btn btn-primary w-25" type="submit">
                  comment
                </button>
              </div>
            </Form>
          </>
        )}
      </div>
    );
  };

  const docEdit = (docType, index) => {
    return (
      <div className="container">
        <Form layout="vertical" onFinish={saveFile}>
          <Form.Item
            label={
              <span className="fs-4">
                {docType.text}&nbsp;&nbsp;
                <Tooltip title="Supported formats: .pdf">
                  <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                </Tooltip>{' '}
                {docType.status !== '-' && (
                  <span className="fs-4">
                    <Badge
                      count={docType.status}
                      color={docType.status === 'revising' ? '#faad14' : docType.status === 'rejected' ? '#f5222d' : '#52c41a'}
                    />
                  </span>
                )}
              </span>
            }
            name="pdf"
          >
            {upload(docType.file, docType.status, index)}
          </Form.Item>
          {previewFile && (
            <div className="pt-1 pb-5 text-center">
              <button className="btn btn-primary w-25" type="submit">
                upload
              </button>
            </div>
          )}
        </Form>
        <div className="pb-5">
          {docType.comments.length > 0 && (
            <>
              <Divider />
              <span>Feedback</span>
            </>
          )}
          {docType.comments.length > 0 &&
            docType.comments?.map((item, index) => {
              return (
                <div className="card my-1">
                  <div className="card-body">
                    <span>{item.comment}</span>
                    <small className="d-flex justify-content-end text-secondary">
                      {item.User?.firstname} ( {dayjs(item.created_at).format('DD/MM/YYYY')} )
                    </small>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    );
  };

  useEffect(() => {
    getEvent();
  }, []);

  return (
    <>
      <div className="px-3">
        <Breadcrumb
          items={[
            { title: <a href="/">Home</a> },
            { title: <a href="/event">Events</a> },
            {
              title: 'Document Information',
            },
          ]}
        />
      </div>
      <div className="mx-5 px-5">
        <div className="p-2 pb-0">
          <h1 style={{ textAlign: 'center', color: '#555' }}>Document Information</h1>
        </div>
        <Divider />
        <div className="border border-2 rounded-3 p-3">
          <Tabs
            tabPosition="left"
            items={new Array(7).fill(null).map((_, i) => {
              const id = String(i + 1);
              return {
                label: listDoc[i].text,
                key: id,
                children: user?.role === 'association' ? docEdit(listDoc[i], i) : docReview(listDoc[i]),
              };
            })}
            onChange={onChangeTab}
          />
        </div>
      </div>
    </>
  );
};

export default EventDocument;
