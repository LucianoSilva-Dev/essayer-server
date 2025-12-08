import type {
  Artigo,
  Citacao,
  GetAllRepertorioDocuments,
  Obra,
  PopulatedWithCriador
} from '../Types';
import { formatArtigoDoc } from './FormatArtigoDoc';
import { formatCitacaoDoc } from './FormatCitacaoDoc';
import { formatObraDoc } from './FormatObraDoc';
import { isRepertorioDocument } from './TypeGuards';

export function formatRepertorio(
  repertorio: any,
  userId?: string,
) {
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

  return null;
}

export function formatGetAllRepertorioQuery(
  repertorios: any[],
  userId?: string,
): GetAllRepertorioDocuments {
  return repertorios.map((repertorio) => formatRepertorio(repertorio, userId));
}
