require('dotenv').config();
const mongoose = require('mongoose');
const Listing = require('../models/listing');
const Review = require('../models/review');

(async () => {
  try {
    await mongoose.connect(process.env.ATLASDB_URL);
    console.log('Connected to MongoDB Atlas');

    // Find all orphaned reviews
    const orphanReviews = await Review.find({ $or: [{ author: null }, { author: { $exists: false } }] });
    const orphanIds = orphanReviews.map(r => r._id);

    console.log(`Found ${orphanIds.length} orphan review(s)`);

    if (orphanIds.length > 0) {
      // Delete orphan reviews
      const deleteResult = await Review.deleteMany({ _id: { $in: orphanIds } });
      console.log(`Deleted ${deleteResult.deletedCount} orphan review(s)`);

      // Remove references from listings
      const updateResult = await Listing.updateMany(
        { reviews: { $in: orphanIds } },
        { $pull: { reviews: { $in: orphanIds } } }
      );
      console.log(`Updated ${updateResult.modifiedCount} listing(s), removed orphan review references.`);
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB Atlas');
  } catch (err) {
    console.error(err);
  }
})();
