import { Injectable } from "@nestjs/common";
import { NotificationRepository } from "./notification.repository";

@Injectable()
export class NotificationService {
  constructor(private readonly repository: NotificationRepository) {}

  async getAll() {}

  async changeStatus() {}

  async listen() {}
}
