import  jwt  from "jsonwebtoken";

const ACCESS_TTL = "15m";
const REFRESH_TTL = "30d";

export const createAccessToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role, tokenVersion: user.tokenVersion },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: ACCESS_TTL}
    );
};

export const createRefreshToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role, tokenVersion: user.tokenVersion },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: REFRESH_TTL }
    );
};

export const verifyAccessToken = (token) => 
    jwt.verify(token, process.env.JWT_ACCESS_SECRET);

export const verifyRefreshToken = (token) =>
  jwt.verify(token, process.env.JWT_REFRESH_SECRET);