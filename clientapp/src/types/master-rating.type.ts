import { Master, Client } from "./user.types";

export interface masterRating {
    id: string,
    ratingNumber: number,
    description?: string,
    createdAt: Date,
    nailMaster: Master,
    client: Client
}