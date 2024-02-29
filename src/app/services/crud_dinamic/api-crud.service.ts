
import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class ApiCrudService<T> {



  private API_URL = 'http://localhost:8070/';

  private production = false;
  private token?: string;

  constructor(private http: HttpClient, @Inject(DOCUMENT) private document: Document) {

  }


  setToken(token: string) {
    this.token = token;
    this.API_URL = this.document.baseURI.replaceAll('vizum_pdf/', '');

  }

  private getHttpOptions() {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',


    });

    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }

    return { headers };
  }


  // Crear un nuevo Item
  createItem(item: any, endPoint: string, method: string): Observable<any> {


    const data = {
      "jsonrpc": "2.0",
      "method": method,
      "params": item
    }
    return this.http.post<any>(this.API_URL + endPoint, data, this.getHttpOptions())
  }




  public uploadPDF(file: File, path: string) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        const base64Content = base64.split(',')[1]; // Eliminar el prefijo de URL de datos

        // Construir el objeto JSON para la solicitud
        const data = {
          "file": base64Content,
          "filename": file.name,
          "path": `${path}/`
        };

        // Enviar el objeto JSON con el archivo en base64
        this.http.post('/upload_pdf', data, this.getHttpOptions()).subscribe(
          (response) => resolve(response),
          (error) => reject(error)
        );
      };
      reader.onerror = (error) => {
        reject(error);
      };
    });
  }
  // Leer todos los Items
  getItems(endPoint: string, method: string): Observable<T[]> {

    const data = {
      "jsonrpc": "2.0",
      "method": method,
      "params": {}
    }
    // try {
    return this.http.post<ApiResponse<T[]>>(this.API_URL + endPoint, data, this.getHttpOptions()).pipe(
      map(response => response.result.data) // Mapea la respuesta para extraer la data
    );
    // } catch (error) {
    //   console.error('Error al crear la carpeta', error);

    //   throw new Error(error.message);

    // }

  }

  // Leer un Item por su ID
  getItemById(id: number, endPoint: string, method: string): Observable<T[]> {
    const url = `${this.API_URL}${endPoint}/${id}`;
    const data = {
      "jsonrpc": "2.0",
      "method": method,
      "params": {}
    }
    // Post y maneja la respuesta dentro de un Observable
    return this.http.post<ApiResponse<T[]>>(url, data, this.getHttpOptions())
      .pipe(
        map(response=>{


console.log("_____----",response.result.data);

          return response.result.data
        }) // Mapea la respuesta para extraer la data
      );
  }
  // Actualizar un Item por su ID
  updateItem(id: number, item: any): Observable<any> {
    const url = `${this.API_URL}/${id}`;

    console.log(url, this.getHttpOptions());

    return this.http.put(url, item, this.getHttpOptions());
  }

  // Eliminar un Item por su ID
  deleteItem(id: number): Observable<any> {
    const url = `${this.API_URL}/${id}`;
    return this.http.delete<any>(url, this.getHttpOptions());
  }

  getFiletiBlob(url: string): Observable<Blob> {
    return this.http.get(url, { responseType: 'blob' });
  }
}


// Primero, define una interfaz para la estructura de tu respuesta
interface ApiResponse<T> {
  jsonrpc: string;
  id: null;
  result: {
    success: boolean;
    data: T;
  };
}