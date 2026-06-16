import jwt from 'jsonwebtoken';

export const protect = async (req, res, next) => {
  try {
    let securityToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      securityToken = req.headers.authorization.split(' ')[1];
    }

    if (!securityToken) {
      return res.status(401).json({ success: false, message: 'Authorization verification token missing.' });
    }

    const tokenDecodedPayload = jwt.verify(securityToken, process.env.JWT_SECRET);
    req.user = { id: tokenDecodedPayload.id };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Authentication credential verification failed.' });
  }
};