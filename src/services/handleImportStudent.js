import axiosInstance from './path/to/axiosInstance'; // Adjust the path as necessary

export const handleImport = async (
  event,
  showSnackbar,
  setIsLoading,
  refreshStudents
) => {
  const file = event.target.files[0];
  if (!file) {
    showSnackbar('No file selected', 'error');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    // 5 MB size limit
    showSnackbar('File size exceeds 5MB', 'error');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  setIsLoading(true); // Start the loading spinner

  try {
    const response = await axiosInstance.post(
      '/studentProfile/import',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    if (response.data.errors && response.data.errors.length > 0) {
      const errorMessages = response.data.errors
        .map((error) => `LRN ${error.lrn}: ${error.errors.join(', ')}`)
        .join('; ');
      showSnackbar(`Import issues: ${errorMessages}`, 'warning');
    } else {
      showSnackbar('Data imported successfully!', 'success');
      refreshStudents(); // Refresh or update the data grid
    }
  } catch (error) {
    console.error('API error:', error);
    const errorMessage =
      error.response?.data?.message || 'An error occurred during importing';
    showSnackbar(errorMessage, 'error');
  } finally {
    setIsLoading(false); // Stop the loading spinner
  }
};
