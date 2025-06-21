import { Request, Response } from "express";
import db from "../../libs/db";
import { FRONTEND_URL } from "../../libs/config";
import { redisClient } from "../../libs/redis";

export const redirectTinyUrl = async (req: Request, res: Response) => {
  console.log(req.params.id);
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "ID parameter is required" });
    }
    const cachedUrl = await redisClient.getRedisValue(`tinyurl:${id}`);
    if (cachedUrl) {
      console.log("Cache hit:", cachedUrl);
      res.redirect(cachedUrl);

      return;
    }
    console.log("Cache miss, fetching from database...");
    // Fetch the original URL from the database using the short URL ID
    const response = await db.query(
      "SELECT url FROM urls WHERE code = $1 AND expires_at > NOW() OR expires_at IS NULL AND deleted_at IS NULL",
      [id]
    );
    if (response.rows.length === 0) {
      res.status(404).json({ error: "URL not found" });
    }
    // Cache the original URL in Redis
    await redisClient.setRedisValue(`tinyurl:${id}`, response.rows[0].url, {
      EX: 60 * 60 * 24, // Cache for 1 day
    });
    console.log("Cached URL:", response.rows[0].url);
    const originalUrl = response.rows[0].url;

    // Redirect to the original URL
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



export const createMillionFakeUrls = async (req: Request, res: Response) => {
  console.log("createMillionFakeUrls controller executing...");
  console.log(req.method, req.url);
  try {
    const originalUrl = "https://example.com";
    const expire_at_default = new Date();
    expire_at_default.setDate(expire_at_default.getDate() + 1);
    const expire_at = expire_at_default; // Default to 1 day from now

    const promises = [];
    for (let i = 0; i < 10000; i++) {
      const code = Math.random().toString(36).substring(2, 8);
      promises.push(
        db.query(
          "INSERT INTO urls (url, code, expires_at) VALUES ($1, $2, $3)",
          [originalUrl, code, expire_at]
        )
      );
    }
    await Promise.all(promises);
    res.status(200).json({ success: "Million fake URLs created" });
  } catch (error) {
    console.error("Error creating million fake URLs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};