import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { podcastService } from '../services/podcastService';
import { toast } from 'react-toastify';
import { Upload, X, Music, Image as ImageIcon, CheckCircle } from 'lucide-react';

export default function AddPodcast() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: 'Technology'
  });
  const [audioFile, setAudioFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Access Control
  if (!user || (user.role !== 'artist' && user.role !== 'admin')) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-500 mb-4">Access Denied</h1>
          <p className="text-zinc-400">Only creators can access this page.</p>
        </div>
      </div>
    );
  }

  const genres = [
    'Technology', 'Music', 'Education', 'Business', 'Comedy', 'News', 'Sports'
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
    } else {
      toast.error('Please upload a valid audio file');
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setThumbnailFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      toast.error('Please upload a valid image file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('--- [FRONTEND] SUBMIT START ---');
    if (!audioFile) {
      console.warn('[FRONTEND] Missing audio file');
      return toast.error('Audio file is required');
    }
    if (!formData.title || !formData.description) {
      console.warn('[FRONTEND] Missing title or description');
      return toast.error('All fields are required');
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('genre', formData.genre);
      data.append('audio', audioFile);
      if (thumbnailFile) {
        data.append('thumbnail', thumbnailFile);
        console.log('[FRONTEND] Thumbnail appended');
      }

      console.log('[FRONTEND] Sending FormData to API...');
      const response = await podcastService.createPodcast(data);
      console.log('[FRONTEND] Upload Success:', response);
      
      toast.success('Podcast uploaded successfully!');
      navigate('/creator-panel');
    } catch (err) {
      console.error('[FRONTEND] Upload Failed:', err);
      if (err.response) {
        console.error('[FRONTEND] Error Response Data:', err.response.data);
        console.error('[FRONTEND] Error Response Status:', err.response.status);
        toast.error(err.response.data.error || `Error ${err.response.status}: Failed to upload`);
      } else if (err.request) {
        console.error('[FRONTEND] No Response Received:', err.request);
        toast.error('Server not responding. Please check your connection.');
      } else {
        console.error('[FRONTEND] Request Error:', err.message);
        toast.error('Failed to send request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto bg-black min-h-screen text-white">
      <div className="mb-10">
        <h1 className="text-4xl font-black mb-2">Add New Podcast</h1>
        <p className="text-zinc-400">Share your voice with the world</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Details */}
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Podcast Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                placeholder="Enter title"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                placeholder="What is this podcast about?"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Genre</label>
              <select
                name="genre"
                value={formData.genre}
                onChange={handleInputChange}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 transition-colors appearance-none"
              >
                {genres.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          {/* Right Column: Uploads */}
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Thumbnail</label>
              <div 
                className={`relative h-48 bg-zinc-900 border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center overflow-hidden transition-all ${previewUrl ? 'border-green-500/50' : 'hover:border-zinc-700'}`}
                onClick={() => document.getElementById('thumbnail-input').click()}
              >
                {previewUrl ? (
                  <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <>
                    <ImageIcon className="text-zinc-700 mb-2" size={32} />
                    <span className="text-zinc-500 text-sm">Upload Thumbnail</span>
                  </>
                )}
                <input 
                  id="thumbnail-input"
                  type="file" 
                  accept="image/*" 
                  onChange={handleThumbnailChange} 
                  className="hidden" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Audio File</label>
              <div 
                className={`p-6 bg-zinc-900 border-2 border-dashed border-zinc-800 rounded-2xl flex items-center gap-4 transition-all ${audioFile ? 'border-green-500/50 bg-green-500/5' : 'hover:border-zinc-700'}`}
                onClick={() => document.getElementById('audio-input').click()}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${audioFile ? 'bg-green-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                  {audioFile ? <CheckCircle size={24} /> : <Music size={24} />}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className={`font-bold text-sm truncate ${audioFile ? 'text-green-500' : 'text-zinc-400'}`}>
                    {audioFile ? audioFile.name : 'Select Audio File'}
                  </p>
                  <p className="text-[10px] text-zinc-600 uppercase">MP3, WAV, M4A or WebM</p>
                </div>
                <input 
                  id="audio-input"
                  type="file" 
                  accept="audio/*" 
                  onChange={handleAudioChange} 
                  className="hidden" 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-900">
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all ${loading ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-green-500 text-black hover:scale-[1.02] active:scale-[0.98]'}`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={20} />
                Publish Podcast
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
