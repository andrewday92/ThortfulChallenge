import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '@environments/environment';
@Injectable({
  providedIn: 'root',
})
export class ApiHttpService {
  private _apiURL = environment.apiUrl;
  private _headers = new HttpHeaders({
    ContentType: 'application/json',
    Authorization: 'Client-ID ' + environment.accessKey
  });

  constructor(private _http: HttpClient) {}

  public get<T>(endpoint?: string, params?: any): Observable<T> {
    return this._http
      .get<T>(`${this._apiURL}${endpoint}`, {
        headers: this._headers,
        params: params,
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(() => console.error(error));
        })
      );
  }
}
