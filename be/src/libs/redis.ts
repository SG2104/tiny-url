import {
  createClient,
  RedisArgument,
  RedisClientType,
  SetOptions,
} from "redis";

class RedisClientService {
  private static instance: RedisClientService; // Holds the single instance of the class
  private client: RedisClientType;

  // Private constructor to prevent direct instantiation
  private constructor() {
    // Initialize the Redis client
    this.client = createClient({
      url: "redis://localhost:6379", // Redis server URL
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
    options?: SetOptions | undefined
  ) {
    try {
      await this.client.set(key, value, options);
      console.log(`Set ${key} = ${value}`);
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
      return null;
    }
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