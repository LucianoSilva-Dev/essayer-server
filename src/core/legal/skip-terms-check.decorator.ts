import { SetMetadata } from '@nestjs/common';

export const SKIP_TERMS_CHECK_KEY = 'skipTermsCheck';
export const SkipTermsCheck = () => SetMetadata(SKIP_TERMS_CHECK_KEY, true);
