import { Module } from "@nestjs/common";
import { CitationController } from "./citation.controller";
import { CitationService } from "./citation.service";
import { CitationRepository } from "./citation.repository";

@Module({
  controllers: [CitationController],
  providers: [CitationService, CitationRepository]
})
export class CitationModule { }