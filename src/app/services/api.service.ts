import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Location, DOCUMENT } from '@angular/common';
import { firstValueFrom } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class ApiService {

  private API_URL = 'http://localhost:8070/';

  private production = false;

  constructor(private http: HttpClient, @Inject(DOCUMENT) private document: Document) {

  }


  public getToken(): Promise<string> {

    this.API_URL = this.document.baseURI.replaceAll('vizum_pdf/', '');

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',

    });
    const data = {
    }
    return firstValueFrom(
      this.http.post<any>(this.API_URL + 'access_token', data, { headers })
    ).then(response => {

      console.log(response.result);


      return response.result.access_token;
    });
    // return this.http.post(this.API_URL + 'access_token', data, { headers });
  }
  public llamarMetodo(): Observable<any> {

    const headers = new HttpHeaders({
      'Content-Type': 'application/json', // Establece aquí el Content-Type
      // Puedes añadir más encabezados personalizados si es necesario
    });


    const data = {

    }
    return this.http.post(this.API_URL, data, { headers });
  }

}
