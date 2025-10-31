export const ACCESS_TOKEN_COOKIE_PATH = '/'
export const REFRESH_TOKEN_COOKIE_PATH = '/auth'

export const AppCookies = {
    accessToken: 'accessToken',
    refreshToken: 'refreshToken'
} as const
export const AppCookiesList = Object.values(AppCookies) as string[]