'use strict';

module.exports = function(dependencies) {
  const mongoose = dependencies('db').mongo.mongoose;
  const Schema = mongoose.Schema;
  const ObjectId = mongoose.Schema.ObjectId;

  const schema = new Schema({
    userId: { type: ObjectId, ref: 'User', index: true, required: true },
    blobId: { type: String, index: true, required: true }, // attachment's blob ID
    documentId: { type: String }, // LinShare document ID
    asyncTaskId: { type: String }
  }, { timestamps: true });

  return mongoose.model('InboxLinshareAttachment', schema);
};
