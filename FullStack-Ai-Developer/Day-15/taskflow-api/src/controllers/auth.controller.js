import {
  registerUser,
  loginUser,
} from "../services/auth.service.js";

export async function register(req, res, next) {
  try {
    const result = await registerUser(req.body ?? {});
    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const result = await loginUser(req.body ?? {});
    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
}