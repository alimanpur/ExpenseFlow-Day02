import cloudinary from '../config/cloudinary.js';

export const uploadReceiptHandler = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'expenseflow/receipts', resource_type: 'auto' },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      stream.end(req.file.buffer);
    });

    return res.status(200).json({ success: true, data: { url: result.secure_url, publicId: result.public_id } });
  } catch (e) { next(e); }
};
