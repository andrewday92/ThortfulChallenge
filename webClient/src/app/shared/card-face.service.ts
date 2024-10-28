import { BrowserStorageService, StorageType, StorageTypes } from './../core/services/local-storage.service';
import { Injectable } from '@angular/core';
import { ApiHttpService } from '../core/services/api-http.service';
import { map, Observable, tap } from 'rxjs';
import { CardFace } from '@models';

@Injectable({
  providedIn: 'root'
})
export class CardFaceService {
  public cardFaceHistory: Array<CardFace> = JSON.parse(localStorage.getItem('cardFaceHistory') ?? '[]');
  constructor(private _api: ApiHttpService, private _browserStorageService: BrowserStorageService) {}

  getTopics(): Observable<any> {
    const params = {
      'per_page': 12
    }

    return this._api.get('topics', params).pipe(
      map((data: any) =>
        data.map((topic:any) => {
          return {title: topic.title, slug: topic.slug}
        }
    ))
    );
  }

  getCardImage(params: any): Observable<any>{
    return this._api.get('photos/random', params).pipe(
      tap((image: any) => {
        this.cardFaceHistory.push({
          src: image.urls.full,
          srcThumb: image.urls.thumb,
          alt: image.alt_description,
          width: image.width,
          height: image.height
        })
        this._browserStorageService.setItem<StorageType>("cardFaceHistory", {data: this.cardFaceHistory.reverse(), type: StorageTypes.Local});
      })
    );
  }
}
