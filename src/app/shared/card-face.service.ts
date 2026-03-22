import { BrowserStorageService, StorageType, StorageTypes } from '../core/services/browser-storage.service';
import { Injectable } from '@angular/core';
import { ApiHttpService } from '../core/services/api-http.service';
import { map, Observable, tap } from 'rxjs';
import { CardFace, Topic, UnsplashImage } from '@models';

@Injectable({
  providedIn: 'root'
})
export class CardFaceService {
  public cardFaceHistory: Array<CardFace> = [];

  constructor(private _api: ApiHttpService, private _browserStorageService: BrowserStorageService) {
    this._loadHistory();
  }

  private _loadHistory(): void {
    const stored = this._browserStorageService.getItem('cardFaceHistory', StorageTypes.Local);
    if (typeof stored === 'string') {
      try {
        this.cardFaceHistory = JSON.parse(stored);
      } catch {
        this.cardFaceHistory = [];
      }
    }
  }

  getTopics(): Observable<Topic[]> {
    const params = {
      'per_page': 12
    }

    return this._api.get<Array<{ title: string; slug: string }>>('topics', params).pipe(
      map((data) =>
        data.map((topic) => ({
          title: topic.title,
          slug: topic.slug
        }))
      )
    );
  }

  getCardImage(params: Record<string, string | number>): Observable<UnsplashImage> {
    return this._api.get<UnsplashImage>('photos/random', params).pipe(
      tap((image) => {
        this.cardFaceHistory.push({
          src: image.urls.full,
          srcThumb: image.urls.thumb,
          alt: image.alt_description,
          width: image.width,
          height: image.height
        });
        this._browserStorageService.setItem<StorageType>("cardFaceHistory", {
          data: [...this.cardFaceHistory].reverse(),
          type: StorageTypes.Local
        });
      })
    );
  }
}
