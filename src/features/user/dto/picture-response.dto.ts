import { createZodDto } from "nestjs-zod";
import z from "zod";

export const pictureResponseSchema = z.object({
  image: z.string().nullable(),
  imageFileId: z.string().nullable(),
});

export class PictureResponseDto extends createZodDto(pictureResponseSchema) {}
