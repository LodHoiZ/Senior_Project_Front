import React, { useEffect, useState } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useDispatch } from 'react-redux';
import { HideLoading, ShowLoading } from '../redux/alertsSlice';
import api from '../helpers/api';
import { Divider, message } from 'antd';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

const Dashboard = () => {
  const [dataStatus, setDataStatus] = useState(null);
  const [dataTerm, setDataTerm] = useState(null);
  const [status, setStatus] = useState(null);
  const dispatch = useDispatch();

  const BarChart = () => {
    // const data = {
    //   labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    //   datasets: [
    //     {
    //       label: 'Term',
    //       data: [12, 19, 3, 5, 2, 3, 7],
    //       backgroundColor: 'rgba(75, 192, 192, 0.2)',
    //       borderColor: 'rgba(75, 192, 192, 1)',
    //       borderWidth: 1,
    //     },
    //   ],
    // };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += `${context.parsed.y}`;
              }
              return label;
            },
          },
        },
        datalabels: {
          color: '#444',
          anchor: 'end',
          align: 'top',
          formatter: (value) => value,
          offset: 4,
          font: {
            weight: 'bold',
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
        },
        y: {
          beginAtZero: true,
        },
      },
    };

    return <Bar data={dataTerm} options={options} />;
  };

  const PieChart = () => {
    return <Pie data={dataStatus} />;
  };

  const getSummaryStatus = async () => {
    try {
      dispatch(ShowLoading());
      const response = await api.get('/events/summary');
      dispatch(HideLoading());
      if (response.data) {
        setDataStatus({
          labels: ['Revising', 'Rejected', 'Completed'],
          datasets: [
            {
              label: 'Event Status',
              data: [response.data['revising'] ?? 0, response.data['rejected'] ?? 0, response.data['completed'] ?? 0],
              backgroundColor: ['rgba(255, 206, 86, 0.2)', 'rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)'],
              borderColor: ['rgba(255, 206, 86, 1)', 'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
              borderWidth: 1,
            },
          ],
        });
        setStatus(response.data);
      } else {
        message.error(response.data);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const getSummaryTerm = async () => {
    try {
      dispatch(ShowLoading());
      const response = await api.get('/events/term');
      dispatch(HideLoading());
      if (response.data) {
        const backgroundColors = 'rgba(107, 106, 177, 0.2)';
        const borderColors = backgroundColors.replace('0.2', '1');
        setDataTerm({
          labels: response.data.labels,
          datasets: [
            {
              label: 'Year',
              data: response.data.data,
              backgroundColor: backgroundColors,
              borderColor: borderColors,
              borderWidth: 1,
            },
          ],
        });
      } else {
        message.error(response.data);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  useEffect(() => {
    getSummaryStatus();
    getSummaryTerm();
  }, []);
  return (
    <>
      {dataStatus && dataTerm && (
        <div className="h-100 shadow-lg rounded-3 p-5">
          <h1 style={{ textAlign: 'center', color: '#555' }}>Dashboard</h1>
          <div className="row row-cols-3 pt-4">
            <div className="col">
              <div className="border border-3 border-gray bg-light bg-gradient rounded-4 p-3">
                <p className="text-center fs-4">{dataStatus.labels[0]}</p>
                <p className="text-center text-secondary fs-5">{status['revising'] ?? 0} Event</p>
              </div>
            </div>
            <div className="col">
              <div className="border border-3 border-gray bg-light bg-gradient rounded-4 p-3">
                <p className="text-center fs-4">{dataStatus.labels[1]}</p>
                <p className="text-center text-warning  fs-5">{status['rejected'] ?? 0} Event</p>
              </div>
            </div>
            <div className="col">
              <div className="border border-3 border-gray bg-light bg-gradient rounded-4 p-3">
                <p className="text-center fs-4">{dataStatus.labels[2]}</p>
                <p className="text-center text-success fs-5">{status['completed'] ?? 0} Event</p>
              </div>
            </div>
          </div>
          <div className="mt-5 pt-2 border border-3 border-gray rounded-4">
            <p className="text-center fs-4">Project By Status</p>
            <div className="d-flex justify-content-center align-items-center py-5">
              <div style={{ width: '400px', height: '400px' }}>
                <PieChart />
              </div>
            </div>
          </div>
          <Divider />
          <div className="pt-2 border border-3 border-gray rounded-4">
            <p className="text-center fs-4">Project By Academic Year</p>
            <div className="d-flex justify-content-center align-items-center py-5">
              <div style={{ width: '50rem' }}>
                <BarChart />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
