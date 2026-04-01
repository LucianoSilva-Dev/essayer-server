import { Module } from "@nestjs/common";
import { RepertoireController } from "./repertoire.controller";
import { RepertoireService } from "./repertoire.service";
import { RepertoireRepository } from "./repertoire.repository";

@Module({
  controllers: [RepertoireController],
  providers: [RepertoireService, RepertoireRepository]
})
export class RepertoireModule { }
