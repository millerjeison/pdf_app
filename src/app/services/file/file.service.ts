import { Injectable } from '@angular/core';
import { File } from 'src/app/interfaces/file';
import { ApiCrudService } from '../crud_dinamic/api-crud.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(private apiCrudService: ApiCrudService<File>) {

  }

  setToken(token: string) {
    this.apiCrudService.setToken(token);
  }




  public createFile(file: File) {
    var data = {
      "name": file.name,
      "id_folder": file.idFolder,
      "rute": file.rute
    }

    console.log({ "Datos createFile": data });

    this.apiCrudService.createItem(data, 'file', 'create_file').subscribe(datos => {
    })
  }
  public getFilesByFolder(idFolder: number): Observable<File[]> {

    return this.apiCrudService.getItemById(idFolder, 'files', 'get_files_by_folder');

  }
  public uploadPDF(file: any, path: string): Promise<any> {
    return this.apiCrudService.uploadPDF(file, path);
  }


  public getFiletiBlob(url: string) {
    return this.apiCrudService.getFiletiBlob(url);
  }

}


