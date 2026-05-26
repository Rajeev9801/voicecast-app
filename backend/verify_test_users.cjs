const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/voicecast').then(async () => {
  await mongoose.connection.db.collection('users').updateOne({email: 'testuser@example.com'}, {$set: {isVerified: true}});
  await mongoose.connection.db.collection('artists').updateOne({email: 'testartist@example.com'}, {$set: {isVerified: true}});
  console.log('Verified test accounts');
  process.exit(0);
});