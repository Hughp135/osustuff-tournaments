import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BehaviorSubject } from 'rxjs';

interface RequestOptions {
  headers?: { [key: string]: string };
  query?: { [key: string]: string };
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private BASE_URL = environment.base_api_url;
  private baseHeaders: { [name: string]: string | string[] };
  public connectionLost = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    this.baseHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    };
  }

  async get(url: string, options: RequestOptions = {}): Promise<object> {
    try {
      const result = await this.http.get(`${this.BASE_URL}${url}`, {
        headers: new HttpHeaders({
          ...this.baseHeaders,
          ...options.headers
        }),
        params: new HttpParams({ fromObject: options.query })
      }).toPromise();
      if (this.connectionLost.getValue() === true) {
        this.connectionLost.next(false);
      }

      return result;
    } catch (e) {
      if (e.status === 504) {
        this.connectionLost.next(true);
      }
      throw e;
    }
  }

  async post(
    url: string,
    data: any,
    options: RequestOptions = {}
  ): Promise<object> {
    return await this.http.post(`${this.BASE_URL}${url}`, data, {
      headers: new HttpHeaders({
        ...this.baseHeaders,
        ...options.headers
      })
    }).toPromise();
  }

  async put(
    url: string,
    data: any,
    options: RequestOptions = {}
  ): Promise<object> {
    return await this.http.put(`${this.BASE_URL}${url}`, data, {
      headers: new HttpHeaders({
        ...this.baseHeaders,
        ...options.headers
      })
    }).toPromise();
  }

  async patch(
    url: string,
    data: any,
    options: RequestOptions = {}
  ): Promise<object> {
    return await this.http.patch(`${this.BASE_URL}${url}`, data, {
      headers: new HttpHeaders({
        ...this.baseHeaders,
        ...options.headers
      })
    }).toPromise();
  }

  async delete(url: string, options: RequestOptions = {}): Promise<object> {
    return await this.http.delete(`${this.BASE_URL}${url}`, {
      headers: new HttpHeaders({
        ...this.baseHeaders,
        ...options.headers
      }),
      params: new HttpParams({ fromObject: options.query })
    }).toPromise();
  }
}
