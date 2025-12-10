import { Request, Response } from "express";
import { createHash } from "crypto";
import db from "../../libs/db";
import { SERVER_CONFIG } from "../../libs/appConfig";
import { redisClient } from "../../libs/redis";

const BASE62_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

const toBase62 = (hash: string): string => {
  // first 12 characters of MD5 hash for better distribution
  const hashPart = hash.substring(0, 12);
  const num = parseInt(hashPart, 16);

  let result = '';
  let temp = num;

  for (let i = 0; i < 6; i++) {
    result = BASE62_CHARS[temp % 62] + result;
    temp = Math.floor(temp / 62);
  }
  return result;
};

const generateHashCode = (originalUrl: string): string => {
  const hash = createHash('sha256');

  const timestamp = Date.now();
  const processId = process.pid;
  const randomComponent = Math.random().toString(36).substring(2, 8);
  const salt = `${timestamp}${processId}${randomComponent}`;

  // Hash the URL + salt
  const dataToHash = `${originalUrl}${salt}`;
  hash.update(dataToHash);
  const sha256Hash = hash.digest('hex');

  return toBase62(sha256Hash);
};

export const redirectTinyUrl = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ error: "ID parameter is required" });
    return;
  }

  // Check Redis cache first
  try {
    const cachedUrl = await redisClient.getRedisValue(`tinyurl:${id}`);
    if (cachedUrl) {
      console.log("Cache hit:", cachedUrl);
      res.json({ url: cachedUrl });
      return;
    }
  } catch (redisError) {
    console.log("Redis error, falling back to database:", redisError);
  }

  const result = await db.query(
    `SELECT url, expires_at::timestamptz, created_at::timestamptz FROM urls
     WHERE code = $1
       AND (expires_at > NOW() AT TIME ZONE 'UTC' OR expires_at IS NULL)
       AND deleted_at IS NULL`,
    [id]
  );

  if (result.rows.length === 0) {
    res.status(404).json({ error: "URL not found or expired" });
    return;
  }

  const originalUrl = result.rows[0].url;
  const expiresAt = result.rows[0].expires_at;
  const createdAt = result.rows[0].created_at;
  console.log("Found in DB:", originalUrl, "expires at:", expiresAt, "created at:", createdAt);

  // Try to cache the URL with proper expiry (don't fail if Redis is down)
  try {
    let ttl: number;
    if (expiresAt) {
      const nowUTC = new Date(); // always in UTC internally
      const expiryDateUTC = new Date(expiresAt);

      // Calculate the exact time difference
      const timeDiffMs = expiryDateUTC.getTime() - nowUTC.getTime();
      const secondsUntilExpiry = Math.max(0, Math.floor(timeDiffMs / 1000));

      if (!isNaN(secondsUntilExpiry) && secondsUntilExpiry > 0) {
        ttl = secondsUntilExpiry;
        console.log(`📅 Expiry: ${expiresAt}, TTL: ${ttl} seconds (${Math.floor(ttl / 3600)}h ${Math.floor((ttl % 3600) / 60)}m ${ttl % 60}s)`);
        console.log(`🔍 Debug - Created: ${createdAt}, Now: ${nowUTC.toISOString()}, Time since creation: ${Math.floor((nowUTC.getTime() - new Date(createdAt).getTime()) / 1000)}s`);
      } else {
        console.warn("⚠️ Invalid or past expiry, fallback to 24h");
        ttl = 86400;
      }
    } else {
      // No expiry set in database - calculate 24h from creation time
      const nowUTC = new Date();
      const createdDateUTC = new Date(createdAt);
      const defaultExpiryUTC = new Date(createdDateUTC.getTime() + 24 * 60 * 60 * 1000); // 24h from creation
      const secondsUntilExpiry = Math.max(0, Math.floor(
        (defaultExpiryUTC.getTime() - nowUTC.getTime()) / 1000
      ));

      ttl = secondsUntilExpiry;
      console.log(`ℹ️ No expiry date in DB, calculated 24h from creation: ${defaultExpiryUTC.toISOString()}, TTL: ${ttl} seconds (${Math.floor(ttl / 3600)}h ${Math.floor((ttl % 3600) / 60)}m ${ttl % 60}s)`);
    }

    await redisClient.setRedisValue(`tinyurl:${id}`, originalUrl, {
      EX: ttl,
    });
    console.log(`✅ Cached in Redis with TTL: ${ttl} seconds (${Math.floor(ttl / 3600)}h ${Math.floor((ttl % 3600) / 60)}m ${ttl % 60}s)`);
  } catch (err) {
    console.error("❌ Redis cache failed:", err);
  }

  res.json({ url: originalUrl });
};



export const createTinyUrl = async (req: Request, res: Response) => {
  try {
    const originalUrl = req.body.originalUrl;
    let expire_at = req.body.expire_at;

    // Set default expiry if not provided
    if (!expire_at) {
      // Calculate exactly 24 hours from now in UTC
      const now = new Date();
      const expireAtDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24h from now
      expire_at = expireAtDate.toISOString();
      console.log(`🕐 Default expiry set to: ${expire_at} (24 hours from now - ${now.toISOString()} + 24h)`);
    } else {
      // Parse the user-provided date (already in UTC from frontend)
      const userDate = new Date(expire_at);
      if (isNaN(userDate.getTime())) {
        res.status(400).json({ error: "Invalid expiry date format" });
        return;
      }

      const nowUTC = new Date();

      if (userDate <= nowUTC) {
        res.status(400).json({ error: "Expiry date must be in the future" });
        return;
      }

      // Use the date as provided by frontend (already in UTC)
      console.log(`📅 User expiry set to: ${expire_at}`);
    }


    if (!originalUrl) {
      res.status(400).json({ error: "Original URL is required" });
      return;
    }
    if (
      !originalUrl.startsWith("http://") &&
      !originalUrl.startsWith("https://")
    ) {
      res.status(400).json({ error: "Invalid URL format" });
      return;
    }

    let code = generateHashCode(originalUrl);
    let shortUrl = `${SERVER_CONFIG.frontendUrl}/${code}`;
    let response;

    // Try to insert, retry with new code if duplicate
    for (let attempts = 0; attempts < 5; attempts++) {
      try {
        response = await db.query(
          "INSERT INTO urls (url, code, expires_at) VALUES ($1, $2, $3::timestamp with time zone) RETURNING *",
          [originalUrl, code, expire_at]
        );
        break; // Success, exit loop
      } catch (error: any) {
        if (error.code === '23505' && attempts < 4) { // Unique constraint violation
          code = generateHashCode(originalUrl + Math.random().toString());
          shortUrl = `${SERVER_CONFIG.frontendUrl}/${code}`;
          continue;
        }
        throw error; // Re-throw if not a duplicate or max attempts reached
      }
    }

    if (!response || response.rows.length === 0) {
      res.status(500).json({ error: "Failed to create URL" });
      return;
    }

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
    const expire_at = expire_at_default;

    const promises = [];
    for (let i = 0; i < 10000; i++) {
      const code = generateHashCode(originalUrl);
      promises.push(
        db.query(
          "INSERT INTO urls (url, code, expires_at) VALUES ($1, $2, $3::timestamp with time zone)",
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

export const getAllUrls = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    const countResult = await db.query("SELECT COUNT(*) FROM urls WHERE deleted_at IS NULL");
    const total = parseInt(countResult.rows[0].count);

    const result = await db.query(
      `SELECT 
        id, 
        url, 
        code, 
        created_at::timestamptz, 
        expires_at::timestamptz 
       FROM urls 
       WHERE deleted_at IS NULL 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.status(200).json({
      data: result.rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching URLs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};