import {
  createClient,
  RedisArgument,
  RedisClientType,
  SetOptions,
} from "redis";
import { REDIS_CONFIG } from "./appConfig";

class RedisClientService {
  private static instance: RedisClientService; // Holds the single instance of the class
  private client: RedisClientType;

  // Private constructor to prevent direct instantiation
  private constructor() {
    // Initialize the Redis client with config
    const redisUrl = process.env.REDIS_URL || `redis://${REDIS_CONFIG.host}:${REDIS_CONFIG.port}`;

    this.client = createClient({
      url: redisUrl,
    });

    // Set up event listeners for connection success and errors
    this.client.on("connect", () => {
      console.log("Connected to Redis");
    });

    this.client.on("error", (err) => {
      console.error("Redis error: " + err);
    });
  }

  // Method to get the singleton instance of RedisClientService
  public static getInstance(): RedisClientService {
    if (!RedisClientService.instance) {
      RedisClientService.instance = new RedisClientService();
    }
    return RedisClientService.instance;
  }

  // Method to connect to Redis
  async connect() {
    try {
      await this.client.connect();
    } catch (error) {
      console.error("Error connecting to Redis:", error);
    }
  }

  // Method to set a value in Redis
  async setRedisValue(
    key: RedisArgument,
    value: number | RedisArgument,
    options?: SetOptions
  ) {
    try {
      if (options?.EX && options.EX > 0) {
        // Ensure EX is explicitly passed as a number
        await this.client.set(key, value, { EX: options.EX });
        console.log(`Set ${key} = ${value} with TTL = ${options.EX} seconds`);
      } else {
        await this.client.set(key, value);
        console.log(`Set ${key} = ${value} with no TTL`);
      }
    } catch (error) {
      console.error("Error setting value in Redis:", error);
    }
  }

  // Method to get a value from Redis
  async getRedisValue(key: string): Promise<string | null> {
    try {
      const value = await this.client.get(key);
      console.log(`Get ${key} = ${value}`);
      return value;
    } catch (error) {
      console.error("Error getting value from Redis:", error);
      // Don't return null on error, let the caller handle it
      throw error;
    }
  }

  async expire(key: string, seconds: number): Promise<number> {
    return this.client.expire(key, seconds);
  }

  // Gracefully shutdown the Redis client
  async shutdown(): Promise<void> {
    try {
      await this.client.quit();
      console.log("Redis client shut down gracefully");
    } catch (error) {
      console.error("Error during Redis shutdown:", error);
    }
  }
}

export default RedisClientService;

export const redisClient = RedisClientService.getInstance();