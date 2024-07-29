const dotenv = require("dotenv");

let ENV_FILE_NAME = "";
switch (process.env.NODE_ENV) {
  case "production":
    ENV_FILE_NAME = ".env.production";
    break;
  case "staging":
    ENV_FILE_NAME = ".env.staging";
    break;
  case "test":
    ENV_FILE_NAME = ".env.test";
    break;
  case "development":
  default:
    ENV_FILE_NAME = ".env";
    break;
}

try {
  dotenv.config({ path: process.cwd() + "/" + ENV_FILE_NAME });
} catch (e) { }

// CORS when consuming Medusa from admin
const ADMIN_CORS =
  process.env.ADMIN_CORS || "http://localhost:7000,http://localhost:7001";

// CORS to avoid issues when consuming Medusa from a client
const STORE_CORS = process.env.STORE_CORS || "http://localhost:8000";

const DATABASE_URL =
  process.env.DATABASE_URL || "postgres://localhost/medusa-starter-default";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const plugins = [
  `medusa-fulfillment-manual`,
  // `medusa-payment-manual`,
  {
    resolve: `@medusajs/file-local`,
    options: {
      upload_dir: "uploads",
    },
  },
  {
    resolve: "@medusajs/admin",
    /** @type {import('@medusajs/admin').PluginOptions} */
    options: {
      autoRebuild: true,
      // develop: {
      //   open: process.env.OPEN_BROWSER !== "false",
      // },
    },
  },
  {
    resolve: "medusa-plugin-static-pages",
    options: {
      enableUI: true,
    },
  },
  {
    resolve: `medusa-plugin-contentful`,
    options: {
      space_id: process.env.CONTENTFUL_SPACE_ID,
      access_token: process.env.CONTENTFUL_ACCESS_TOKEN,
      environment: process.env.CONTENTFUL_ENV,
    },
  },
  {
    resolve: `medusa-plugin-algolia`,
    options: {
      applicationId: process.env.ALGOLIA_APP_ID,
      adminApiKey: process.env.ALGOLIA_ADMIN_API_KEY,
      settings: {
        products: {
          indexSettings: {
            searchableAttributes: ["title", "description"],
            attributesToRetrieve: [
              "id",
              "title",
              "description",
              "handle",
              "thumbnail",
              "options",
            ],
          },
          transformer: (item) => {
            return {
              objectID: item.id,
              title: item.title,
              handle: item.handle,
              thumbnail: item.thumbnail,
              subtitle: item.subtitle,
              tags: item.tags,
              description: item.description,
              material: item.material,
              metadata: item.metadata,
              collection_title: item.collection ? item.collection.title : "",
              collection_handle: item.collection ? item.collection.handle : "",
            };
          },
        },
      },
    },
  },
  {
    resolve: "medusa-payment-razorpay",
    options: {
      key_id: process.env.RAZORPAY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
      razorpay_account: process.env.RAZORPAY_ACCOUNT,
      automatic_expiry_period: 30,
      manual_expiry_period: 20,
      refund_speed: "normal",
      webhook_secret: process.env.RAZORPAY_SECRET
    }
  }
];

const modules = {
  /*eventBus: {
    resolve: "@medusajs/event-bus-redis",
    options: {
      redisUrl: REDIS_URL
    }
  },
  cacheService: {
    resolve: "@medusajs/cache-redis",
    options: {
      redisUrl: REDIS_URL
    }
  },*/
};

/** @type {import('@medusajs/medusa').ConfigModule["projectConfig"]} */
const projectConfig = {
  jwt_secret: process.env.JWT_SECRET || "supersecret",
  cookie_secret: process.env.COOKIE_SECRET || "supersecret",
  store_cors: STORE_CORS,
  database_url: DATABASE_URL,
  admin_cors: ADMIN_CORS,
  database_extra: process.env.NODE_ENV !== "development" ?
    {
      ssl: {
        rejectUnauthorized: false,
      },
    } : {},
  // worker_mode: "worker",
  // Uncomment the following lines to enable REDIS
  // redis_url: REDIS_URL
};

/** @type {import('@medusajs/medusa').ConfigModule} */
module.exports = {
  projectConfig,
  plugins,
  modules,
};
