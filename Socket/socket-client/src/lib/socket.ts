import { io } from "socket.io-client";

const Api = typeof window === "undefined"
  ? process.env.API_URL
  : process.env.NEXT_PUBLIC_API_URL

// const Api = process.env.NEXT_PUBLIC_API_URL
export const socket = io(Api);