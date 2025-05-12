// types/youtube-search-api.d.ts
declare module 'youtube-search-api' {
  export function GetListByKeyword(
    keyword: string,
    param2?: boolean,
    param3?: number
  ): Promise<any>;

  export function GetVideosResult(
    keyword: string,
    param2?: number
  ): Promise<any>;

  export function GetVideoDetails(videoId: string): Promise<any>;

  // Add more exported functions if needed.
}
