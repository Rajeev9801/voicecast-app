import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';

export default function AdminPanel() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!title || !audioFile) {
      alert('Title and audio file required');
      return;
    }

    setLoading(true);
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('author', author);
    formData.append('category', category);
    formData.append('audio', audioFile);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const { data } = await api.post('/api/podcasts/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Podcast uploaded successfully!');
      setTitle('');
      setDescription('');
      setAuthor('');
      setCategory('');
      setAudioFile(null);
      setImageFile(null);
    } catch (err) {
      toast.error('Upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Upload Podcast</h1>

        <form onSubmit={handleUpload} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Podcast title"
              className="w-full px-4 py-2 bg-gray-800 rounded border border-gray-600 focus:border-green-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your podcast"
              className="w-full px-4 py-2 bg-gray-800 rounded border border-gray-600 focus:border-green-500 outline-none h-24"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Author</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-2 bg-gray-800 rounded border border-gray-600 focus:border-green-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 rounded border border-gray-600 focus:border-green-500 outline-none"
              >
                <option value="">Select category</option>
                <option value="tech">Tech</option>
                <option value="news">News</option>
                <option value="music">Music</option>
                <option value="education">Education</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Audio File *</label>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setAudioFile(e.target.files?.[0])}
              className="w-full px-4 py-2 bg-gray-800 rounded border border-gray-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Thumbnail Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0])}
              className="w-full px-4 py-2 bg-gray-800 rounded border border-gray-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 rounded"
          >
            {loading ? 'Uploading...' : 'Upload Podcast'}
          </button>
        </form>
      </div>
    </div>
  );
}
