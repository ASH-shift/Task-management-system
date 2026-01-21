import { Router } from "express";
import bcrypt from "bcrypt";
import prisma from "../prisma";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";

const router = Router();

/* REGISTER */
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashed },
      select: { id: true, email: true } // 🔐 hide password
    });

    res.status(201).json(user);
  } catch (err: any) {
    if (err.code === "P2002")
      return res.status(409).json({ message: "Email already exists" });

    res.status(500).json({ message: "Server error" });
  }
});

/* LOGIN */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: "Invalid credentials" });

    const access = generateAccessToken(user.id);
    const refresh = generateRefreshToken(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: refresh }
    });

    res.json({ access, refresh });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
