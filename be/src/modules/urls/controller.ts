import { Request, Response } from "express";
import db from "../../libs/db";
import { FRONTEND_URL } from "../../libs/config";

export const redirectTinyUrl = async (req: Request, res: Response) => {
  console.log(req.params.id);
  try {
    const { id } = req.params;
    const response = await db.query(
      "SELECT url FROM urls WHERE code = $1 AND expires_at > NOW() AND deleted_at IS NULL",
      [id]
    );
    if (response.rows.length === 0) {
      res.status(404).json({ error: "URL not found" });
    }
    const originalUrl = response.rows[0].url;
    res.redirect(originalUrl);
  } catch (error) {
    console.error("Error redirecting to tiny URL:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createTinyUrl = async (req: Request, res: Response) => {
  try {
    const originalUrl = req.body.originalUrl;
    const expire_at_default = new Date();
    expire_at_default.setDate(expire_at_default.getDate() + 1);
    const expire_at = req.body.expire_at || expire_at_default; // Default to 1 day from now if not provided

    if (!originalUrl) {
      res.status(400).json({ error: "Original URL is required" });
    }
    if (
      !originalUrl.startsWith("http://") &&
      !originalUrl.startsWith("https://")
    ) {
      res.status(400).json({ error: "Invalid URL format" });
    }

    const code = Math.random().toString(36).substring(2, 8);
    const shortUrl = `${FRONTEND_URL}/${code}`;

    const response = await db.query(
      "INSERT INTO urls (url, code,expires_at) VALUES ($1, $2,$3) RETURNING *",
      [originalUrl, code, expire_at]
    );
    res.status(200).json({ success: "url created", url: shortUrl });
  } catch (error) {
    console.error("Error creating tiny URL:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};