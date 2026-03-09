import { env } from "@/config/env";

const TOKEN_KEY = env.TOKEN_KEY || "token";

export class TokenStorage {
  static set(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  static get() {
    return localStorage.getItem(TOKEN_KEY);
  }

  static remove() {
    localStorage.removeItem(TOKEN_KEY);
  }

  static isAuthenticated() {
    return !!this.get();
  }
}

const notImpFields = ["_id", "createdAt", "updatedAt", "__v"];

export const isImpField = (field: string) => {
  if (notImpFields.includes(field)) return false;
  return true;
};
