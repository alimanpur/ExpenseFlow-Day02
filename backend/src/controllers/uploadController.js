export const uploadReceiptHandler = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });
    return res.status(200).json({ success: true, data: { url: req.file.path, publicId: req.file.filename } });
  } catch (e) { next(e); }
};
