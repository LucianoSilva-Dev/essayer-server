import type { HydratedDocument } from 'mongoose';
import type {
  Artigo,
  Citacao,
  GetAllRepertorioDocuments,
  Obra,
  PopulatedWithCriador,
  Repertorio,
} from '../Types';
import { isRepertorioDocument } from './TypeGuards';
import { formatObraDoc } from './FormatObraDoc';
import { formatArtigoDoc } from './FormatArtigoDoc';
import { formatCitacaoDoc } from './FormatCitacaoDoc';

export function formatGetAllRepertorioQuery(
  repertorios: any[],
  userId?: string,
): GetAllRepertorioDocuments {
  return repertorios.map((repertorio) => {
    if (isRepertorioDocument<Obra & PopulatedWithCriador>(repertorio, 'Obra'))
      return formatObraDoc(repertorio, userId);
    if (
      isRepertorioDocument<Artigo & PopulatedWithCriador>(repertorio, 'Artigo')
    )
      return formatArtigoDoc(repertorio, userId);
    if (
      isRepertorioDocument<Citacao & PopulatedWithCriador>(
        repertorio,
        'Citacao',
      )
    )
      return formatCitacaoDoc(repertorio, userId);
  });
}
