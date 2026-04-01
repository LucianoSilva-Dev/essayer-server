import { Module } from "@nestjs/common";
import { UserEssayController } from "./user-essay.controller";
import { UserEssayService } from "./user-essay.service";
import { UserEssayRepository } from "./user-essay.repository";

@Module({
  controllers: [UserEssayController],
  providers: [UserEssayService, UserEssayRepository]
})
export class UserEssayModule { }
