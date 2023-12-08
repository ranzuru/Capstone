import { useState, useEffect } from 'react';
import axiosInstance from '../config/axios-instance';

const useFetchRole = () => {
  const [roleOptions, setRoleOptions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axiosInstance.get('role/fetchRoleNames');
        const formattedRoles = response.data.map((roleName) => ({
          label: roleName,
          value: roleName,
        }));
        setRoleOptions(formattedRoles);
      } catch (e) {
        setError(e);
      }
    };

    fetchRoles();
  }, []);

  return { roleOptions, error };
};

export default useFetchRole;
