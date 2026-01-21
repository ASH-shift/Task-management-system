import jwt from "jsonwebtoken";

export const generateAccessToken = (id: number) =>
  jwt.sign({ id }, process.env.ACCESS_SECRET!, { expiresIn: "15m" });

export const generateRefreshToken = (id: number) =>
  jwt.sign({ id }, process.env.REFRESH_SECRET!, { expiresIn: "7d" });
