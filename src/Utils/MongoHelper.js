import { Types } from 'mongoose';

export const isMongoObjectId = (id) => {
  try {
    let i = new Types.ObjectId(id);
    if (!i) {
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
};

export const getDocument = async (MODEL, where, ignoreSoftDeletedDocuments = true) => {
  if (!MODEL.findOne) {
    throw new Error('getDocumentFromModel: Model is not a mongo schema!');
  }

  if (ignoreSoftDeletedDocuments) {
    where = {
      ...where,
      deletedAt: null
    };
  }

  return await MODEL.findOne({
    ...where
  });
};

export const softDeleteDocument = async (MODEL, where) => {
  if (!MODEL.findOne) {
    throw new Error('softDeleteDocument: Model is not a mongo schema!');
  }
  let doc = await getDocument(MODEL, where);
  doc.deletedAt = new Date();
  doc.updatedAt = new Date();
  return await doc.save();
};

export const updateDocument = async (MODEL, where, data, isSoftDeletedDocument = false) => {
  if (!MODEL.findOne) {
    throw new Error('updateDocument: Model is not a mongo schema!');
  }

  let doc = await getDocument(MODEL, where, !isSoftDeletedDocument);

  Object.keys(where).forEach((key) => {
    if (!Object.hasOwn(doc, key)) {
      return;
    }

    doc[key] = where[key];
  });

  Object.keys(data).forEach((key) => {
    if (!Object.hasOwn(doc, key)) {
      return;
    }

    doc[key] = data[key];
  });

  doc.updatedAt = new Date();

  return await doc.save();
};

export const getDocByForeignKey = async (MODEL, value, lookup) => {
  if (!value) {
    return null;
  }
  return (
    await MODEL.aggregate([
      {
        $match: {
          value
        }
      },
      {
        $lookup: lookup
      }
    ])
  )[0];
};
