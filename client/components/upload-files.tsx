import axios from 'axios';
import toast from 'react-hot-toast';

export const uploadFile = async (file: any, setImage: any, setLoading: any) => {
  try {
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/auth/upload-file`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    setImage(data.fileUrls[0]);
    return data.fileUrls[0];
  } catch (error) {
    console.error(error);
    toast.error('Failed to upload file');
  } finally {
    setLoading(false);
  }
};
