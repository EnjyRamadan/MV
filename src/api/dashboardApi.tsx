import axios from 'axios';

export const getDashboardForCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found in localStorage');
    }

   const userRes = await axios.get('/auth/me', {
  headers: { Authorization: `Bearer ${token}` },
  withCredentials: true,
});


    console.log('User object from /auth/me:', userRes.data);

    // Try both id and _id since MongoDB uses _id
    const userId = userRes.data.id || userRes.data._id;
    console.log('User ID:', userId);

    if (!userId) {
      throw new Error('User ID not found');
    }

    const dashboardRes = await axios.get(`http://localhost:5000/dashboard/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('Dashboard data:', dashboardRes.data);

    return dashboardRes.data;
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    throw error;
  }
};
