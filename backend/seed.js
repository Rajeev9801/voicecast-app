import Podcast from './models/Podcast.js';

const seedPodcasts = async (userId) => {
  const count = await Podcast.countDocuments();
  if (count > 0) return;

  const samples = [
    {
      title: "The Joe Rogan Experience",
      description: "Conversations with interesting people from all walks of life.",
      category: "Talk Show",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      createdBy: userId
    },
    {
      title: "Tech Crunch Weekly",
      description: "The latest news and analysis from the world of technology.",
      category: "Technology",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      createdBy: userId
    },
    {
      title: "Mystery Hour",
      description: "Dive deep into unsolved mysteries and true crime stories.",
      category: "True Crime",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      createdBy: userId
    },
    {
      title: "Healthy Living",
      description: "Tips and tricks for a healthier and happier lifestyle.",
      category: "Health",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
      createdBy: userId
    }
  ];

  await Podcast.insertMany(samples);
  console.log("Sample podcasts seeded!");
};

export default seedPodcasts;
